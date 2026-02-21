/**
 * Ably Real-time Messaging Routes
 *
 * API endpoints for Ably real-time messaging.
 * Used for live chat and notifications during psychic reading sessions.
 */

import { Hono } from "hono";
import Ably from "ably";
import { env } from "../env";
import { type AppType } from "../types";

export const ablyRouter = new Hono<AppType>();

// Initialize Ably REST client for token generation
const getAblyClient = (): Ably.Rest | null => {
  if (!env.ABLY_API_KEY) {
    return null;
  }
  return new Ably.Rest({ key: env.ABLY_API_KEY });
};

/**
 * Generate Ably token for client authentication
 * POST /api/ably/token
 *
 * Request body:
 * - clientId?: string - Client ID (defaults to user ID)
 * - capability?: object - Channel capabilities
 */
ablyRouter.post("/token", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const ably = getAblyClient();
    if (!ably) {
      return c.json({ error: "Ably is not configured" }, 503);
    }

    const body = await c.req.json().catch(() => ({}));
    const clientId = body.clientId || user.id;

    // Default capabilities - user can subscribe to their own channels
    const defaultCapability = {
      [`session:*`]: ["subscribe", "publish", "presence"],
      [`notifications:${user.id}`]: ["subscribe"],
      ["readers:availability"]: ["subscribe"],
    };

    const capability = body.capability || defaultCapability;

    const tokenRequest = await ably.auth.createTokenRequest({
      clientId,
      capability,
    });

    console.log(`[Ably] Token generated for user: ${user.id}`);

    return c.json(tokenRequest);
  } catch (error) {
    console.error("[Ably] Token generation failed:", error);
    return c.json({ error: "Failed to generate token" }, 500);
  }
});

/**
 * Publish a message to a channel (server-side)
 * POST /api/ably/publish
 *
 * Request body:
 * - channel: string - Channel name
 * - event: string - Event name
 * - data: any - Message data
 */
ablyRouter.post("/publish", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const ably = getAblyClient();
    if (!ably) {
      return c.json({ error: "Ably is not configured" }, 503);
    }

    const body = await c.req.json();
    const { channel: channelName, event, data } = body;

    if (!channelName || !event) {
      return c.json({ error: "Channel and event are required" }, 400);
    }

    const channel = ably.channels.get(channelName);
    await channel.publish(event, {
      ...data,
      senderId: user.id,
      timestamp: Date.now(),
    });

    console.log(`[Ably] Message published to ${channelName}:${event} by user: ${user.id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("[Ably] Publish failed:", error);
    return c.json({ error: "Failed to publish message" }, 500);
  }
});

/**
 * Check Ably configuration status
 * GET /api/ably/status
 */
ablyRouter.get("/status", async (c) => {
  const isConfigured = !!env.ABLY_API_KEY;

  return c.json({
    configured: isConfigured,
  });
});
