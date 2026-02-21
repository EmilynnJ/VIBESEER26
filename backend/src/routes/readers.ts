import { Hono } from "hono";
import { db } from "../db";
import type { AppType } from "../types";

export const readersRouter = new Hono<AppType>();

/**
 * GET /api/readers
 * Get all readers with their profiles
 */
readersRouter.get("/", async (c) => {
  try {
    const readers = await db.readerProfile.findMany({
      orderBy: [{ isOnline: "desc" }, { rating: "desc" }],
    });

    // Parse specialties from JSON string to array
    const readersWithParsedData = readers.map((reader) => ({
      ...reader,
      specialties: reader.specialties ? JSON.parse(reader.specialties) : null,
    }));

    return c.json({ readers: readersWithParsedData });
  } catch (error) {
    console.error("Error fetching readers:", error);
    return c.json({ error: "Failed to fetch readers" }, 500);
  }
});

/**
 * GET /api/readers/:id
 * Get a specific reader by ID with their reviews
 */
readersRouter.get("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));

    if (isNaN(id)) {
      return c.json({ error: "Invalid reader ID" }, 400);
    }

    const reader = await db.readerProfile.findUnique({
      where: { id },
    });

    if (!reader) {
      return c.json({ error: "Reader not found" }, 404);
    }

    // Get reviews for this reader
    const reviews = await db.review.findMany({
      where: { readerId: reader.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Parse specialties from JSON string to array
    const readerWithParsedData = {
      ...reader,
      specialties: reader.specialties ? JSON.parse(reader.specialties) : null,
    };

    return c.json({
      reader: readerWithParsedData,
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: review.user,
      })),
    });
  } catch (error) {
    console.error("Error fetching reader:", error);
    return c.json({ error: "Failed to fetch reader" }, 500);
  }
});
