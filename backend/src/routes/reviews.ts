import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import type { AppType } from "../types";
import { requireAuth } from "../middleware/auth";

export const reviewsRouter = new Hono<AppType>();

// Apply auth middleware to all review routes
reviewsRouter.use("*", requireAuth);

// ============================================
// POST /api/reviews - Create a review
// ============================================
const createReviewSchema = z.object({
  readerId: z.string().uuid("Invalid reader ID"),
  sessionId: z.number().int().positive().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000, "Comment too long").optional(),
});

reviewsRouter.post("/", zValidator("json", createReviewSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { readerId, sessionId, rating, comment } = c.req.valid("json");

  try {
    // Verify reader exists
    const reader = await db.user.findUnique({
      where: { id: readerId, role: "READER" },
      include: { ReaderProfile: true },
    });

    if (!reader || !reader.ReaderProfile) {
      return c.json({ error: "Reader not found" }, 404);
    }

    // If session ID provided, verify user had a session with this reader
    if (sessionId) {
      const session = await db.readingSession.findUnique({
        where: { id: sessionId },
      });

      if (!session || session.clientId !== user.id || session.readerId !== readerId) {
        return c.json({ error: "Invalid session" }, 400);
      }

      if (session.status !== "COMPLETED") {
        return c.json({ error: "Can only review completed sessions" }, 400);
      }

      // Check if already reviewed
      const existingReview = await db.review.findFirst({
        where: {
          userId: user.id,
          readerId,
        },
      });

      if (existingReview) {
        return c.json({ error: "You have already reviewed this reader" }, 400);
      }
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId: user.id,
        readerId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update reader's average rating and total reviews
    const allReviews = await db.review.findMany({
      where: { readerId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.readerProfile.update({
      where: { userId: readerId },
      data: {
        rating: avgRating,
        totalReviews: allReviews.length,
      },
    });

    console.log(`[Review] Created review for reader ${readerId} by user ${user.id}: ${rating} stars`);

    return c.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        userName: review.user.name,
      },
    }, 201);
  } catch (error) {
    console.error("[Review] Failed to create review:", error);
    return c.json({ error: "Failed to create review" }, 500);
  }
});

// ============================================
// GET /api/reviews/reader/:readerId - Get reviews for a reader
// ============================================
reviewsRouter.get("/reader/:readerId", async (c) => {
  const readerId = c.req.param("readerId");

  try {
    const reviews = await db.review.findMany({
      where: { readerId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return c.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        userName: r.user.name,
      })),
    });
  } catch (error) {
    console.error("[Review] Failed to get reviews:", error);
    return c.json({ error: "Failed to get reviews" }, 500);
  }
});

// ============================================
// GET /api/reviews/my - Get user's reviews
// ============================================
reviewsRouter.get("/my", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const reviews = await db.review.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            name: true,
            ReaderProfile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ reviews });
  } catch (error) {
    console.error("[Review] Failed to get user reviews:", error);
    return c.json({ error: "Failed to get reviews" }, 500);
  }
});

// ============================================
// PUT /api/reviews/:id - Update a review
// ============================================
const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000, "Comment too long").optional(),
});

reviewsRouter.put("/:id", zValidator("json", updateReviewSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const reviewId = parseInt(c.req.param("id"));
  const { rating, comment } = c.req.valid("json");

  try {
    // Check if review exists and belongs to user
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return c.json({ error: "Review not found" }, 404);
    }

    if (existingReview.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Update the review
    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: comment !== undefined ? comment : undefined,
      },
    });

    // Recalculate reader's average rating
    const allReviews = await db.review.findMany({
      where: { readerId: existingReview.readerId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.readerProfile.update({
      where: { userId: existingReview.readerId },
      data: {
        rating: avgRating,
      },
    });

    console.log(`[Review] Updated review ${reviewId}`);

    return c.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error("[Review] Failed to update review:", error);
    return c.json({ error: "Failed to update review" }, 500);
  }
});

// ============================================
// DELETE /api/reviews/:id - Delete a review
// ============================================
reviewsRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const reviewId = parseInt(c.req.param("id"));

  try {
    // Check if review exists and belongs to user
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return c.json({ error: "Review not found" }, 404);
    }

    if (existingReview.userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Delete the review
    await db.review.delete({
      where: { id: reviewId },
    });

    // Recalculate reader's average rating
    const allReviews = await db.review.findMany({
      where: { readerId: existingReview.readerId },
      select: { rating: true },
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db.readerProfile.update({
        where: { userId: existingReview.readerId },
        data: {
          rating: avgRating,
          totalReviews: allReviews.length,
        },
      });
    } else {
      // No reviews left
      await db.readerProfile.update({
        where: { userId: existingReview.readerId },
        data: {
          rating: null,
          totalReviews: 0,
        },
      });
    }

    console.log(`[Review] Deleted review ${reviewId}`);

    return c.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("[Review] Failed to delete review:", error);
    return c.json({ error: "Failed to delete review" }, 500);
  }
});
