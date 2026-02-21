import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import type { AppType } from "../types";

export const userRouter = new Hono<AppType>();

// ============================================
// GET /api/user/me - Get current user profile
// ============================================
userRouter.get("/me", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Get user with balance from database
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      balance: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user: dbUser });
});

// ============================================
// GET /api/user/balance - Get user balance
// ============================================
userRouter.get("/balance", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { balance: true },
  });

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ balance: dbUser.balance });
});

// ============================================
// POST /api/user/balance/add - Add funds to balance
// ============================================
const addBalanceSchema = z.object({
  amount: z.number().positive().min(5, "Minimum add is $5").max(1000, "Maximum add is $1000"),
});

userRouter.post("/balance/add", zValidator("json", addBalanceSchema), async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { amount } = c.req.valid("json");

  // Update user balance and create transaction
  const [updatedUser, transaction] = await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: {
        balance: {
          increment: amount,
        },
      },
      select: { balance: true },
    }),
    db.transaction.create({
      data: {
        userId: user.id,
        type: "BALANCE_ADD",
        amount,
        description: `Added $${amount.toFixed(2)} to balance`,
      },
    }),
  ]);

  return c.json({
    success: true,
    balance: updatedUser.balance,
    transaction,
  });
});

// ============================================
// GET /api/user/transactions - Get user transactions
// ============================================
userRouter.get("/transactions", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return c.json({ transactions });
});

// ============================================
// GET /api/user/sessions - Get user reading sessions
// ============================================
userRouter.get("/sessions", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sessions = await db.readingSession.findMany({
    where: {
      OR: [{ clientId: user.id }, { readerId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return c.json({ sessions });
});
