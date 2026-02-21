/**
 * Agora Video Calling Service
 *
 * This module provides Agora video calling integration for the SoulSeer app.
 * Used for live video psychic reading sessions between readers and clients.
 */

import { Platform } from "react-native";

// Agora App ID from environment
const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID;

/**
 * Check if Agora is configured
 */
export const isAgoraConfigured = (): boolean => {
  return !!AGORA_APP_ID;
};

/**
 * Get the Agora App ID
 */
export const getAgoraAppId = (): string | undefined => {
  return AGORA_APP_ID;
};

/**
 * Agora configuration
 */
export const agoraConfig = {
  appId: AGORA_APP_ID,
  // Channel profile: 0 = Communication (1-on-1), 1 = Live Broadcasting
  channelProfile: 0,
  // Client role: 1 = Host, 2 = Audience
  clientRoleType: 1,
};

/**
 * Generate a unique channel name for a reading session
 * @param readerId - The reader's user ID
 * @param clientId - The client's user ID
 * @param sessionId - The session ID
 */
export const generateChannelName = (
  readerId: string,
  clientId: string,
  sessionId: string
): string => {
  return `soulseer_${readerId}_${clientId}_${sessionId}`;
};

/**
 * Check if the platform supports video calling
 */
export const isVideoCallSupported = (): boolean => {
  // Video calling requires native platform (iOS/Android)
  return Platform.OS === "ios" || Platform.OS === "android";
};

// Log configuration status
if (isAgoraConfigured()) {
  console.log("[AgoraService] Agora is configured and ready");
  console.log(`[AgoraService] Platform: ${Platform.OS}`);
  console.log(`[AgoraService] Video call supported: ${isVideoCallSupported()}`);
} else {
  console.log("[AgoraService] Agora is not configured - video calling will be disabled");
}

export { AGORA_APP_ID };
