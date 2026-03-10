import type { Brief } from "../../shared/schema.js";

interface AirIncBrief {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  platforms: string[];
  creatorsNeeded: number;
  requester?: string;
  responsible?: string;
  priority?: string;
  campaignTopic?: string;
  metadata?: {
    source: string;
    brief_id: number;
    org_name: string;
  };
}

interface SyncResult {
  success: boolean;
  campaignId?: string;
  error?: string;
}

export class AirIncService {
  private apiKey: string;
  private apiUrl: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.AIR_INC_API_KEY || "";
    this.apiUrl = process.env.AIR_INC_API_URL || "https://api.air.inc/v1";
    this.enabled = process.env.AIR_INC_ENABLED === "true";
  }

  /**
   * Sync a brief to air.inc platform
   * Creates a new campaign in air.inc with the brief details
   */
  async syncBrief(brief: Brief): Promise<SyncResult> {
    if (!this.enabled) {
      return { success: false, error: "air.inc integration not enabled" };
    }

    if (!this.apiKey || this.apiKey === "your_api_key_here") {
      return { success: false, error: "air.inc API key not configured" };
    }

    try {
      const payload = this.mapBriefToAirInc(brief);

      const response = await fetch(`${this.apiUrl}/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[AirInc] Sync failed:", response.status, errorText);
        return {
          success: false,
          error: `API error ${response.status}: ${errorText}`
        };
      }

      const data = await response.json();
      console.log("[AirInc] Sync successful:", data.id);

      return {
        success: true,
        campaignId: data.id || data.campaign_id
      };
    } catch (error: any) {
      console.error("[AirInc] Sync error:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred"
      };
    }
  }

  /**
   * Sync a brief with retry logic
   * Retries up to maxRetries times with exponential backoff
   */
  async syncWithRetry(brief: Brief, maxRetries = 3): Promise<SyncResult> {
    let attempt = 0;
    let lastError: string | undefined;

    while (attempt < maxRetries) {
      const result = await this.syncBrief(brief);

      if (result.success) {
        return result;
      }

      lastError = result.error;
      attempt++;

      // Don't retry on configuration errors
      if (lastError?.includes("not enabled") || lastError?.includes("not configured")) {
        return result;
      }

      // Don't retry on client errors (4xx)
      if (lastError?.includes("API error 4")) {
        return result;
      }

      // Retry on network errors and 5xx errors
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt); // Exponential backoff
        console.log(`[AirInc] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: `Failed after ${maxRetries} attempts: ${lastError}`
    };
  }

  /**
   * Map our Brief format to air.inc's expected format
   */
  private mapBriefToAirInc(brief: Brief): AirIncBrief {
    // Calculate total budget (budget per creator * number of creators)
    const budgetPerCreator = parseFloat(brief.rewardAmount) || 0;
    const totalBudget = budgetPerCreator * (brief.creatorsNeeded || 1);

    return {
      title: brief.title,
      description: brief.overview,
      budget: totalBudget,
      deadline: brief.deadline.toISOString(),
      platforms: brief.platforms || [],
      creatorsNeeded: brief.creatorsNeeded || 1,
      requester: brief.requester || undefined,
      responsible: brief.responsible || undefined,
      priority: brief.priority || undefined,
      campaignTopic: brief.campaignTopic || undefined,
      metadata: {
        source: "bountyboard",
        brief_id: brief.id,
        org_name: brief.orgName,
      },
    };
  }

  /**
   * Sleep helper for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if air.inc integration is enabled and configured
   */
  isConfigured(): boolean {
    return this.enabled && !!this.apiKey && this.apiKey !== "your_api_key_here";
  }
}

// Export singleton instance
export const airIncService = new AirIncService();
