import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

async function fetchUser(): Promise<User | null> {
  // Check localStorage first for demo/test auth
  const storedUser = localStorage.getItem("auth_user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      // Invalid stored data, clear it
      localStorage.removeItem("auth_user");
    }
  }

  // Fall back to API call (for production OAuth/session auth)
  const response = await fetch("/api/auth-user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth-user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
