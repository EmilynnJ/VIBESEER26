/**
 * Clerk Authentication Client
 *
 * This module provides Clerk authentication integration for the SoulSeer app.
 * Clerk handles user authentication, session management, and user profiles.
 */

import * as SecureStore from "expo-secure-store";

// Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Token cache for Clerk using SecureStore
 * This securely stores authentication tokens on the device
 */
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("[ClerkClient] Error getting token:", error);
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("[ClerkClient] Error saving token:", error);
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("[ClerkClient] Error clearing token:", error);
    }
  },
};

/**
 * Check if Clerk is configured
 */
export const isClerkConfigured = (): boolean => {
  return !!CLERK_PUBLISHABLE_KEY;
};

/**
 * Get the Clerk publishable key
 */
export const getClerkPublishableKey = (): string | undefined => {
  return CLERK_PUBLISHABLE_KEY;
};

// Log configuration status
if (isClerkConfigured()) {
  console.log("[ClerkClient] Clerk is configured and ready");
} else {
  console.log("[ClerkClient] Clerk is not configured - authentication features will be limited");
}
