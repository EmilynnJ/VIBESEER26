import type { Context } from "hono";
import type { AppType } from "../types";

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export const requireAuth = async (c: Context<AppType>, next: () => Promise<void>) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized. Please sign in." }, 401);
  }

  return next();
};

/**
 * Middleware to require admin role
 * Returns 403 if user is not an admin
 */
export const requireAdmin = async (c: Context<AppType>, next: () => Promise<void>) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized. Please sign in." }, 401);
  }

  // Get full user data from context to check role
  const session = c.get("session");
  if (!session) {
    return c.json({ error: "Invalid session" }, 401);
  }

  // Check if user has admin role via database
  const { db } = await import("../db");
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return c.json(
      { error: "Forbidden. Admin access required." },
      403
    );
  }

  return next();
};

/**
 * Middleware to require reader role
 * Returns 403 if user is not a reader
 */
export const requireReader = async (c: Context<AppType>, next: () => Promise<void>) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized. Please sign in." }, 401);
  }

  const { db } = await import("../db");
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "READER") {
    return c.json(
      { error: "Forbidden. Reader access required." },
      403
    );
  }

  return next();
};

/**
 * Middleware to require either admin or reader role
 */
export const requireAdminOrReader = async (c: Context<AppType>, next: () => Promise<void>) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized. Please sign in." }, 401);
  }

  const { db } = await import("../db");
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "READER")) {
    return c.json(
      { error: "Forbidden. Reader or Admin access required." },
      403
    );
  }

  return next();
};
