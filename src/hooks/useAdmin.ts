import { useState, useEffect } from "react";
import { getAdminToken, verifyAdminToken } from "@/services/admin";

interface UseAdminOptions {
  /** If true, only checks if token exists without verifying with server */
  skipVerification?: boolean;
}

interface UseAdminReturn {
  isAdmin: boolean;
  isLoading: boolean;
}

/**
 * Hook to check if the current user is logged in as an admin.
 * By default, verifies the token with the server.
 * Set skipVerification to true for a quick check (just checks if token exists).
 */
export function useAdmin(options: UseAdminOptions = {}): UseAdminReturn {
  const { skipVerification = false } = options;

  // For skipVerification, initialize directly from localStorage
  const [isAdmin, setIsAdmin] = useState(() => {
    if (skipVerification) {
      return !!getAdminToken();
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(!skipVerification);

  useEffect(() => {
    if (!skipVerification) {
      // Full verification with server
      verifyAdminToken().then((isValid) => {
        setIsAdmin(isValid);
        setIsLoading(false);
      });
    }
  }, [skipVerification]);

  return { isAdmin, isLoading };
}
