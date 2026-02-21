/**
 * Agora Routes
 *
 * API endpoints for Agora video calling token generation.
 * Used to securely generate tokens for video reading sessions.
 */

import { Hono } from "hono";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { env } from "../env";
import { type AppType } from "../types";

export const agoraRouter = new Hono<AppType>();

/**
 * Generate RTC token for video calling
 * POST /api/agora/token
 *
 * Request body:
 * - channelName: string - The channel name for the call
 * - uid: number - User ID (0 for auto-assign)
 * - role: "host" | "audience" - User's role in the call
 * - expirationTimeInSeconds?: number - Token expiration time (default: 3600)
 */
agoraRouter.post("/token", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    if (!env.AGORA_APP_ID || !env.AGORA_APP_CERTIFICATE) {
      return c.json({ error: "Agora is not configured" }, 503);
    }

    const body = await c.req.json();
    const { channelName, uid = 0, role = "host", expirationTimeInSeconds = 3600 } = body;

    if (!channelName) {
      return c.json({ error: "Channel name is required" }, 400);
    }

    // Determine role
    const agoraRole = role === "audience" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    // Calculate privilege expire time
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      env.AGORA_APP_ID,
      env.AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      agoraRole,
      privilegeExpiredTs
    );

    console.log(`[Agora] Token generated for channel: ${channelName}, user: ${user.id}`);

    return c.json({
      token,
      appId: env.AGORA_APP_ID,
      channelName,
      uid,
      expiresAt: privilegeExpiredTs,
    });
  } catch (error) {
    console.error("[Agora] Token generation failed:", error);
    return c.json({ error: "Failed to generate token" }, 500);
  }
});

/**
 * Check Agora configuration status
 * GET /api/agora/status
 */
agoraRouter.get("/status", async (c) => {
  const isConfigured = !!(env.AGORA_APP_ID && env.AGORA_APP_CERTIFICATE);

  return c.json({
    configured: isConfigured,
    appId: isConfigured ? env.AGORA_APP_ID : undefined,
  });
});
