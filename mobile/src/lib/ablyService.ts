/**
 * Ably Real-time Messaging Service
 *
 * This module provides Ably real-time messaging integration for the SoulSeer app.
 * Used for live chat during psychic reading sessions and real-time notifications.
 */

import Ably from "ably";

// Ably API Key from environment
const ABLY_API_KEY = process.env.EXPO_PUBLIC_ABLY_API_KEY;

// Ably client instance (lazy initialized)
let ablyClient: Ably.Realtime | null = null;

/**
 * Check if Ably is configured
 */
export const isAblyConfigured = (): boolean => {
  return !!ABLY_API_KEY;
};

/**
 * Get the Ably client instance
 * Creates a new instance if one doesn't exist
 */
export const getAblyClient = (): Ably.Realtime | null => {
  if (!isAblyConfigured()) {
    console.log("[AblyService] Ably is not configured");
    return null;
  }

  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      key: ABLY_API_KEY,
      clientId: `soulseer-${Date.now()}`, // Will be replaced with actual user ID
    });

    ablyClient.connection.on("connected", () => {
      console.log("[AblyService] Connected to Ably");
    });

    ablyClient.connection.on("disconnected", () => {
      console.log("[AblyService] Disconnected from Ably");
    });

    ablyClient.connection.on("failed", (err) => {
      console.error("[AblyService] Ably connection failed:", err);
    });
  }

  return ablyClient;
};

/**
 * Initialize Ably with a specific user ID
 * @param userId - The user's ID for client identification
 */
export const initializeAbly = (userId: string): Ably.Realtime | null => {
  if (!isAblyConfigured()) {
    console.log("[AblyService] Ably is not configured");
    return null;
  }

  // Close existing connection if any
  if (ablyClient) {
    ablyClient.close();
  }

  ablyClient = new Ably.Realtime({
    key: ABLY_API_KEY,
    clientId: userId,
  });

  ablyClient.connection.on("connected", () => {
    console.log("[AblyService] Connected to Ably with user:", userId);
  });

  return ablyClient;
};

/**
 * Get a channel for a reading session chat
 * @param sessionId - The reading session ID
 */
export const getSessionChannel = (sessionId: string): Ably.RealtimeChannel | null => {
  const client = getAblyClient();
  if (!client) return null;

  return client.channels.get(`session:${sessionId}`);
};

/**
 * Get a channel for user notifications
 * @param userId - The user's ID
 */
export const getNotificationChannel = (userId: string): Ably.RealtimeChannel | null => {
  const client = getAblyClient();
  if (!client) return null;

  return client.channels.get(`notifications:${userId}`);
};

/**
 * Get a channel for reader availability updates
 */
export const getReadersChannel = (): Ably.RealtimeChannel | null => {
  const client = getAblyClient();
  if (!client) return null;

  return client.channels.get("readers:availability");
};

/**
 * Disconnect from Ably
 */
export const disconnectAbly = (): void => {
  if (ablyClient) {
    ablyClient.close();
    ablyClient = null;
    console.log("[AblyService] Disconnected from Ably");
  }
};

// Log configuration status
if (isAblyConfigured()) {
  console.log("[AblyService] Ably is configured and ready");
} else {
  console.log("[AblyService] Ably is not configured - real-time messaging will be disabled");
}

export { ABLY_API_KEY };
