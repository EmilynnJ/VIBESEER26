import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import type { AppType } from "../types";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const adminRouter = new Hono<AppType>();

// Apply auth middleware to all admin routes
adminRouter.use("*", requireAuth);
adminRouter.use("*", requireAdmin);

// ============================================
// POST /api/admin/readers - Create reader account
// ============================================
const createReaderSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  chatRatePerMin: z.number().min(0).default(0),
  phoneRatePerMin: z.number().min(0).default(0),
  videoRatePerMin: z.number().min(0).default(0),
});

adminRouter.post("/readers", zValidator("json", createReaderSchema), async (c) => {
  const data = c.req.valid("json");

  try {
    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return c.json({ error: "Email already exists" }, 400);
    }

    // Create user with READER role and hashed password using Bun's built-in password hashing
    const hashedPassword = await Bun.password.hash(data.password);

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: "READER",
        emailVerified: true, // Auto-verify admin-created accounts
      },
    });

    // Create account with password
    await db.account.create({
      data: {
        id: `account_${user.id}`,
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
      },
    });

    // Create reader profile
    const readerProfile = await db.readerProfile.create({
      data: {
        userId: user.id,
        displayName: data.displayName,
        bio: data.bio,
        specialties: data.specialties ? JSON.stringify(data.specialties) : null,
        yearsExperience: data.yearsExperience,
        chatRatePerMin: data.chatRatePerMin,
        phoneRatePerMin: data.phoneRatePerMin,
        videoRatePerMin: data.videoRatePerMin,
        isOnline: false,
        isAvailable: true,
      },
    });

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      readerProfile: {
        id: readerProfile.id,
        displayName: readerProfile.displayName,
        chatRatePerMin: readerProfile.chatRatePerMin,
        phoneRatePerMin: readerProfile.phoneRatePerMin,
        videoRatePerMin: readerProfile.videoRatePerMin,
      },
    }, 201);
  } catch (error) {
    console.error("Error creating reader:", error);
    return c.json({ error: "Failed to create reader account" }, 500);
  }
});

// ============================================
// GET /api/admin/readers - Get all readers
// ============================================
adminRouter.get("/readers", async (c) => {
  const readers = await db.user.findMany({
    where: { role: "READER" },
    include: {
      ReaderProfile: true,
      readerSessions: {
        select: {
          totalAmount: true,
        },
      },
    },
  });

  const readersWithStats = readers.map((reader) => ({
    id: reader.id,
    email: reader.email,
    name: reader.name,
    createdAt: reader.createdAt,
    profile: reader.ReaderProfile,
    totalEarnings: reader.readerSessions.reduce((sum, session) => sum + session.totalAmount, 0),
    totalSessions: reader.ReaderProfile?.totalSessions || 0,
  }));

  return c.json({ readers: readersWithStats });
});

// ============================================
// PUT /api/admin/readers/:id - Update reader
// ============================================
const updateReaderSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  chatRatePerMin: z.number().min(0).optional(),
  phoneRatePerMin: z.number().min(0).optional(),
  videoRatePerMin: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  profileImage: z.string().optional(),
});

adminRouter.put("/readers/:id", zValidator("json", updateReaderSchema), async (c) => {
  const readerId = c.req.param("id");
  const data = c.req.valid("json");

  try {
    // Check if reader exists
    const reader = await db.user.findUnique({
      where: { id: readerId, role: "READER" },
      include: { ReaderProfile: true },
    });

    if (!reader || !reader.ReaderProfile) {
      return c.json({ error: "Reader not found" }, 404);
    }

    // Update user if name is provided
    if (data.name) {
      await db.user.update({
        where: { id: readerId },
        data: { name: data.name },
      });
    }

    // Update reader profile
    const updatedProfile = await db.readerProfile.update({
      where: { id: reader.ReaderProfile.id },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        specialties: data.specialties ? JSON.stringify(data.specialties) : undefined,
        yearsExperience: data.yearsExperience,
        chatRatePerMin: data.chatRatePerMin,
        phoneRatePerMin: data.phoneRatePerMin,
        videoRatePerMin: data.videoRatePerMin,
        isAvailable: data.isAvailable,
        profileImage: data.profileImage,
      },
    });

    return c.json({
      success: true,
      readerProfile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating reader:", error);
    return c.json({ error: "Failed to update reader" }, 500);
  }
});

// ============================================
// DELETE /api/admin/readers/:id - Delete reader
// ============================================
adminRouter.delete("/readers/:id", async (c) => {
  const readerId = c.req.param("id");

  try {
    const reader = await db.user.findUnique({
      where: { id: readerId, role: "READER" },
    });

    if (!reader) {
      return c.json({ error: "Reader not found" }, 404);
    }

    // Delete user (cascades to profile, sessions, etc.)
    await db.user.delete({
      where: { id: readerId },
    });

    return c.json({ success: true, message: "Reader deleted successfully" });
  } catch (error) {
    console.error("Error deleting reader:", error);
    return c.json({ error: "Failed to delete reader" }, 500);
  }
});

// ============================================
// GET /api/admin/users - Get all users
// ============================================
adminRouter.get("/users", async (c) => {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      balance: true,
      createdAt: true,
      emailVerified: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ users });
});

// ============================================
// GET /api/admin/stats - Get platform statistics
// ============================================
adminRouter.get("/stats", async (c) => {
  const [
    totalUsers,
    totalReaders,
    totalClients,
    totalSessions,
    completedSessions,
    totalRevenue,
    recentTransactions,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "READER" } }),
    db.user.count({ where: { role: "CLIENT" } }),
    db.readingSession.count(),
    db.readingSession.count({ where: { status: "COMPLETED" } }),
    db.transaction.aggregate({
      where: { type: "SESSION_PAYMENT" },
      _sum: { amount: true },
    }),
    db.transaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  return c.json({
    stats: {
      totalUsers,
      totalReaders,
      totalClients,
      totalSessions,
      completedSessions,
      totalRevenue: totalRevenue._sum.amount || 0,
      platformRevenue: (totalRevenue._sum.amount || 0) * 0.3, // 30% platform cut
    },
    recentTransactions,
  });
});
