import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import type { AppType } from "../types";
import { requireAuth, requireAdminOrReader, requireAdmin } from "../middleware/auth";

export const payoutsRouter = new Hono<AppType>();

// Apply auth middleware
payoutsRouter.use("*", requireAuth);

// ============================================
// GET /api/payouts/earnings - Get reader earnings
// ============================================
payoutsRouter.get("/earnings", requireAdminOrReader, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Get reader profile
    const readerProfile = await db.readerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!readerProfile) {
      return c.json({ error: "Reader profile not found" }, 404);
    }

    // Get all session earnings
    const sessions = await db.readingSession.findMany({
      where: {
        readerId: user.id,
        status: "COMPLETED",
      },
      select: {
        totalAmount: true,
        totalMinutes: true,
        sessionType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate earnings (70% of session amounts)
    const totalEarned = sessions.reduce((sum, session) => sum + session.totalAmount * 0.7, 0);

    // Get payout history
    const payouts = await db.transaction.findMany({
      where: {
        userId: user.id,
        type: "PAYOUT",
      },
      orderBy: { createdAt: "desc" },
    });

    const totalPaidOut = payouts.reduce((sum, payout) => sum + Math.abs(payout.amount), 0);

    // Available balance is current user balance (should match accumulated earnings - payouts)
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    return c.json({
      earnings: {
        totalEarned,
        totalPaidOut,
        availableBalance: dbUser?.balance || 0,
        totalSessions: sessions.length,
      },
      sessions: sessions.map((s) => ({
        amount: s.totalAmount,
        readerEarnings: s.totalAmount * 0.7,
        minutes: s.totalMinutes,
        type: s.sessionType,
        date: s.createdAt,
      })),
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: Math.abs(p.amount),
        description: p.description,
        date: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Payouts] Failed to get earnings:", error);
    return c.json({ error: "Failed to get earnings" }, 500);
  }
});

// ============================================
// POST /api/payouts/request - Request a payout
// ============================================
const requestPayoutSchema = z.object({
  amount: z.number().positive().min(15, "Minimum payout is $15"),
  payoutMethod: z.enum(["STRIPE", "PAYPAL", "BANK_TRANSFER"]).optional(),
});

payoutsRouter.post("/request", requireAdminOrReader, zValidator("json", requestPayoutSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { amount, payoutMethod = "STRIPE" } = c.req.valid("json");

  try {
    // Check reader balance
    const reader = await db.user.findUnique({
      where: { id: user.id },
      select: { balance: true, role: true },
    });

    if (!reader || reader.role !== "READER") {
      return c.json({ error: "Only readers can request payouts" }, 403);
    }

    if (reader.balance < amount) {
      return c.json({
        error: "Insufficient balance",
        availableBalance: reader.balance,
        requestedAmount: amount,
      }, 400);
    }

    if (amount < 15) {
      return c.json({ error: "Minimum payout is $15" }, 400);
    }

    // Create payout transaction (deduct from balance)
    const [updatedUser, transaction] = await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      }),
      db.transaction.create({
        data: {
          userId: user.id,
          readerId: user.id,
          type: "PAYOUT",
          amount: -amount, // Negative for payout
          description: `Payout request via ${payoutMethod} - $${amount.toFixed(2)}`,
        },
      }),
    ]);

    console.log(`[Payouts] Payout requested by reader ${user.id}: $${amount} via ${payoutMethod}`);

    // In production, this would trigger actual Stripe/PayPal transfer
    // For now, we just record the transaction

    return c.json({
      success: true,
      payout: {
        id: transaction.id,
        amount,
        method: payoutMethod,
        status: "pending",
        remainingBalance: updatedUser.balance,
      },
    }, 201);
  } catch (error) {
    console.error("[Payouts] Failed to request payout:", error);
    return c.json({ error: "Failed to request payout" }, 500);
  }
});

// ============================================
// GET /api/payouts/history - Get payout history
// ============================================
payoutsRouter.get("/history", requireAdminOrReader, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const payouts = await db.transaction.findMany({
      where: {
        userId: user.id,
        type: "PAYOUT",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return c.json({
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: Math.abs(p.amount),
        description: p.description,
        date: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Payouts] Failed to get payout history:", error);
    return c.json({ error: "Failed to get payout history" }, 500);
  }
});

// ============================================
// GET /api/payouts/all - Admin: Get all pending payouts
// ============================================
payoutsRouter.get("/all", requireAdmin, async (c) => {
  try {
    const payouts = await db.transaction.findMany({
      where: {
        type: "PAYOUT",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return c.json({
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: Math.abs(p.amount),
        description: p.description,
        date: p.createdAt,
        reader: {
          name: p.user.name,
          email: p.user.email,
        },
      })),
    });
  } catch (error) {
    console.error("[Payouts] Failed to get all payouts:", error);
    return c.json({ error: "Failed to get payouts" }, 500);
  }
});

// ============================================
// GET /api/payouts/analytics - Get earnings analytics
// ============================================
payoutsRouter.get("/analytics", requireAdminOrReader, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Get sessions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = await db.readingSession.findMany({
      where: {
        readerId: user.id,
        status: "COMPLETED",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        totalAmount: true,
        totalMinutes: true,
        sessionType: true,
        createdAt: true,
      },
    });

    // Calculate metrics
    const earningsLast30Days = recentSessions.reduce((sum, s) => sum + s.totalAmount * 0.7, 0);
    const sessionsLast30Days = recentSessions.length;
    const averageSessionLength = sessionsLast30Days > 0
      ? recentSessions.reduce((sum, s) => sum + s.totalMinutes, 0) / sessionsLast30Days
      : 0;

    // Group by session type
    const byType = recentSessions.reduce((acc, s) => {
      if (!acc[s.sessionType]) {
        acc[s.sessionType] = { count: 0, earnings: 0 };
      }
      acc[s.sessionType].count++;
      acc[s.sessionType].earnings += s.totalAmount * 0.7;
      return acc;
    }, {} as Record<string, { count: number; earnings: number }>);

    return c.json({
      analytics: {
        last30Days: {
          earnings: earningsLast30Days,
          sessions: sessionsLast30Days,
          averageSessionLength,
        },
        byType,
      },
    });
  } catch (error) {
    console.error("[Payouts] Failed to get analytics:", error);
    return c.json({ error: "Failed to get analytics" }, 500);
  }
});
