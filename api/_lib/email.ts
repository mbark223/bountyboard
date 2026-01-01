import { VercelRequest, VercelResponse } from "@vercel/node";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Email service abstraction
 * In production, this would use a service like:
 * - SendGrid
 * - AWS SES
 * - Postmark
 * - Resend
 * 
 * For demo, we'll just log the email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, from = "noreply@bountyboard.com" } = options;
  
  // In production, uncomment and configure your email service:
  /*
  // Example with SendGrid:
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  await sgMail.send({
    to,
    from,
    subject,
    html,
  });
  */
  
  // For demo, just log the email
  console.log("=== EMAIL SENT ===");
  console.log(`From: ${from}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${html}`);
  console.log("==================");
}

/**
 * Generate invite email HTML
 */
export function generateInviteEmail(
  recipientEmail: string,
  inviteUrl: string,
  personalMessage?: string,
  senderName: string = "The BountyBoard Team"
): string {
  const message = personalMessage 
    ? `<p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 20px 0;">${personalMessage}</p>` 
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to BountyBoard</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #7B5CFA;">BountyBoard</h1>
                            <p style="margin: 10px 0 0; font-size: 16px; color: #6b7280;">Creator Platform</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px 30px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #111827;">You're Invited!</h2>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                                Hi there,
                            </p>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                                You've been invited to join BountyBoard as a content creator. This is your opportunity to work with amazing brands and earn rewards for your creative content.
                            </p>
                            
                            ${message}
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #7B5CFA; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">Accept Invitation</a>
                            </div>
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="color: #7B5CFA; font-size: 14px; line-height: 1.5; margin: 5px 0 20px; word-break: break-all;">
                                ${inviteUrl}
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                                This invitation expires in 7 days. If you have any questions, please reach out to our support team.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                                Sent by ${senderName}
                            </p>
                            <p style="margin: 5px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} BountyBoard. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}