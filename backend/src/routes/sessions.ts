import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import type { AppType } from "../types";
import { requireAuth, requireAdminOrReader } from "../middleware/auth";

export const sessionsRouter = new Hono<AppType>();

// Apply auth middleware to all session routes
sessionsRouter.use("*", requireAuth);

// ============================================
// POST /api/sessions/start - Start a new reading session
// ============================================
const startSessionSchema = z.object({
  readerId: z.string().uuid("Invalid reader ID"),
  sessionType: z.enum(["CHAT", "PHONE", "VIDEO"]),
});

sessionsRouter.post("/start", zValidator("json", startSessionSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { readerId, sessionType } = c.req.valid("json");

  try {
    // Get reader profile to check availability and rates
    const readerProfile = await db.readerProfile.findUnique({
      where: { userId: readerId },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!readerProfile) {
      return c.json({ error: "Reader not found" }, 404);
    }

    if (!readerProfile.isAvailable) {
      return c.json({ error: "Reader is not available" }, 400);
    }

    // Get the appropriate rate based on session type
    let ratePerMinute: number;
    switch (sessionType) {
      case "CHAT":
        ratePerMinute = readerProfile.chatRatePerMin;
        break;
      case "PHONE":
        ratePerMinute = readerProfile.phoneRatePerMin;
        break;
      case "VIDEO":
        ratePerMinute = readerProfile.videoRatePerMin;
        break;
      default:
        return c.json({ error: "Invalid session type" }, 400);
    }

    if (ratePerMinute <= 0) {
      return c.json({ error: "Reader does not offer this service type" }, 400);
    }

    // Check if client has sufficient balance (minimum 5 minutes)
    const client = await db.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    if (!client) {
      return c.json({ error: "Client not found" }, 404);
    }

    const minimumBalance = ratePerMinute * 5; // Minimum 5 minutes of reading
    if (client.balance < minimumBalance) {
      return c.json({
        error: "Insufficient balance",
        requiredBalance: minimumBalance,
        currentBalance: client.balance,
        message: `You need at least $${minimumBalance.toFixed(2)} for a ${sessionType.toLowerCase()} session with this reader.`,
      }, 400);
    }

    // Create the reading session
    const session = await db.readingSession.create({
      data: {
        clientId: user.id,
        readerId,
        sessionType,
        status: "ACTIVE",
        startTime: new Date(),
        ratePerMinute,
      },
      include: {
        reader: {
          select: {
            name: true,
            ReaderProfile: {
              select: {
                displayName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    console.log(`[Session] Started ${sessionType} session ${session.id} between client ${user.id} and reader ${readerId}`);

    return c.json({
      success: true,
      session: {
        id: session.id,
        sessionType: session.sessionType,
        status: session.status,
        startTime: session.startTime,
        ratePerMinute: session.ratePerMinute,
        reader: {
          name: session.reader.name,
          displayName: session.reader.ReaderProfile?.displayName,
          profileImage: session.reader.ReaderProfile?.profileImage,
        },
      },
    }, 201);
  } catch (error) {
    console.error("[Session] Failed to start session:", error);
    return c.json({ error: "Failed to start session" }, 500);
  }
});

// ============================================
// POST /api/sessions/:id/end - End a reading session
// ============================================
sessionsRouter.post("/:id/end", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sessionId = parseInt(c.req.param("id"));

  try {
    // Get the session
    const session = await db.readingSession.findUnique({
      where: { id: sessionId },
      include: {
        client: { select: { balance: true } },
        reader: { select: { balance: true } },
      },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Verify user is part of the session
    if (session.clientId !== user.id && session.readerId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    if (session.status !== "ACTIVE") {
      return c.json({ error: "Session is not active" }, 400);
    }

    // Calculate session duration and cost
    const endTime = new Date();
    const startTime = session.startTime || endTime;
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.ceil(durationMs / 60000); // Round up to nearest minute
    const totalAmount = durationMinutes * session.ratePerMinute;

    // Calculate revenue split (70% to reader, 30% to platform)
    const readerEarnings = totalAmount * 0.7;
    const platformFee = totalAmount * 0.3;

    // Check if client has enough balance
    if (session.client.balance < totalAmount) {
      // Partial payment - use remaining balance
      const actualAmount = session.client.balance;
      const actualReaderEarnings = actualAmount * 0.7;

      // Update session and balances
      await db.$transaction([
        // Update session to completed with actual amount
        db.readingSession.update({
          where: { id: sessionId },
          data: {
            status: "COMPLETED",
            endTime,
            totalMinutes: durationMinutes,
            totalAmount: actualAmount,
          },
        }),
        // Deduct from client balance
        db.user.update({
          where: { id: session.clientId },
          data: { balance: 0 }, // Use all remaining balance
        }),
        // Add to reader balance
        db.user.update({
          where: { id: session.readerId },
          data: {
            balance: {
              increment: actualReaderEarnings,
            },
          },
        }),
        // Update reader profile stats
        db.readerProfile.update({
          where: { userId: session.readerId },
          data: {
            totalSessions: {
              increment: 1,
            },
          },
        }),
        // Create transaction for client
        db.transaction.create({
          data: {
            userId: session.clientId,
            readerId: session.readerId,
            type: "SESSION_PAYMENT",
            amount: -actualAmount,
            description: `${session.sessionType} session - ${durationMinutes} minutes (partial)`,
          },
        }),
        // Create transaction for reader earnings
        db.transaction.create({
          data: {
            userId: session.readerId,
            readerId: session.readerId,
            type: "SESSION_PAYMENT",
            amount: actualReaderEarnings,
            description: `Earnings from ${session.sessionType} session - ${durationMinutes} minutes`,
          },
        }),
      ]);

      console.log(`[Session] Ended session ${sessionId} with partial payment: $${actualAmount.toFixed(2)}`);

      return c.json({
        success: true,
        session: {
          id: sessionId,
          status: "COMPLETED",
          durationMinutes,
          totalAmount: actualAmount,
          warning: "Insufficient balance - partial payment applied",
        },
      });
    }

    // Full payment transaction
    await db.$transaction([
      // Update session to completed
      db.readingSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endTime,
          totalMinutes: durationMinutes,
          totalAmount,
        },
      }),
      // Deduct from client balance
      db.user.update({
        where: { id: session.clientId },
        data: {
          balance: {
            decrement: totalAmount,
          },
        },
      }),
      // Add to reader balance
      db.user.update({
        where: { id: session.readerId },
        data: {
          balance: {
            increment: readerEarnings,
          },
        },
      }),
      // Update reader profile stats
      db.readerProfile.update({
        where: { userId: session.readerId },
        data: {
          totalSessions: {
            increment: 1,
          },
        },
      }),
      // Create transaction for client
      db.transaction.create({
        data: {
          userId: session.clientId,
          readerId: session.readerId,
          type: "SESSION_PAYMENT",
          amount: -totalAmount,
          description: `${session.sessionType} session - ${durationMinutes} minutes`,
        },
      }),
      // Create transaction for reader earnings
      db.transaction.create({
        data: {
          userId: session.readerId,
          readerId: session.readerId,
          type: "SESSION_PAYMENT",
          amount: readerEarnings,
          description: `Earnings from ${session.sessionType} session - ${durationMinutes} minutes`,
        },
      }),
    ]);

    console.log(`[Session] Ended session ${sessionId}: ${durationMinutes} minutes, $${totalAmount.toFixed(2)} (reader: $${readerEarnings.toFixed(2)}, platform: $${platformFee.toFixed(2)})`);

    return c.json({
      success: true,
      session: {
        id: sessionId,
        status: "COMPLETED",
        durationMinutes,
        totalAmount,
        readerEarnings,
        platformFee,
      },
    });
  } catch (error) {
    console.error("[Session] Failed to end session:", error);
    return c.json({ error: "Failed to end session" }, 500);
  }
});

// ============================================
// GET /api/sessions/:id - Get session details
// ============================================
sessionsRouter.get("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sessionId = parseInt(c.req.param("id"));

  try {
    const session = await db.readingSession.findUnique({
      where: { id: sessionId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reader: {
          select: {
            id: true,
            name: true,
            ReaderProfile: {
              select: {
                displayName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Verify user is part of the session
    if (session.clientId !== user.id && session.readerId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json({ session });
  } catch (error) {
    console.error("[Session] Failed to get session:", error);
    return c.json({ error: "Failed to get session" }, 500);
  }
});

// ============================================
// GET /api/sessions/active - Get active sessions
// ============================================
sessionsRouter.get("/active", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const sessions = await db.readingSession.findMany({
      where: {
        OR: [{ clientId: user.id }, { readerId: user.id }],
        status: "ACTIVE",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        reader: {
          select: {
            id: true,
            name: true,
            ReaderProfile: {
              select: {
                displayName: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    return c.json({ sessions });
  } catch (error) {
    console.error("[Session] Failed to get active sessions:", error);
    return c.json({ error: "Failed to get active sessions" }, 500);
  }
});

// ============================================
// POST /api/sessions/:id/cancel - Cancel a session
// ============================================
sessionsRouter.post("/:id/cancel", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sessionId = parseInt(c.req.param("id"));

  try {
    const session = await db.readingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Only client or reader can cancel
    if (session.clientId !== user.id && session.readerId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    if (session.status !== "PENDING" && session.status !== "ACTIVE") {
      return c.json({ error: "Cannot cancel this session" }, 400);
    }

    // Update session status
    await db.readingSession.update({
      where: { id: sessionId },
      data: {
        status: "CANCELLED",
        endTime: new Date(),
      },
    });

    console.log(`[Session] Cancelled session ${sessionId}`);

    return c.json({
      success: true,
      message: "Session cancelled successfully",
    });
  } catch (error) {
    console.error("[Session] Failed to cancel session:", error);
    return c.json({ error: "Failed to cancel session" }, 500);
  }
});

// ============================================
// PUT /api/sessions/reader/status - Update reader online status
// ============================================
const updateStatusSchema = z.object({
  isOnline: z.boolean(),
  isAvailable: z.boolean().optional(),
});

sessionsRouter.put("/reader/status", zValidator("json", updateStatusSchema), requireAdminOrReader, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { isOnline, isAvailable } = c.req.valid("json");

  try {
    const readerProfile = await db.readerProfile.update({
      where: { userId: user.id },
      data: {
        isOnline,
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
      },
    });

    console.log(`[Session] Reader ${user.id} status updated: online=${isOnline}, available=${readerProfile.isAvailable}`);

    return c.json({
      success: true,
      profile: {
        isOnline: readerProfile.isOnline,
        isAvailable: readerProfile.isAvailable,
      },
    });
  } catch (error) {
    console.error("[Session] Failed to update reader status:", error);
    return c.json({ error: "Failed to update status" }, 500);
  }
});
