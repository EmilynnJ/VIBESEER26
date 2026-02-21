import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";

import { auth } from "./auth";
import { env } from "./env";
import { uploadRouter } from "./routes/upload";
import { sampleRouter } from "./routes/sample";
import { readersRouter } from "./routes/readers";
import { agoraRouter } from "./routes/agora";
import { stripeRouter } from "./routes/stripe";
import { ablyRouter } from "./routes/ably";
import { userRouter } from "./routes/user";
import { adminRouter } from "./routes/admin";
import { sessionsRouter } from "./routes/sessions";
import { reviewsRouter } from "./routes/reviews";
import { payoutsRouter } from "./routes/payouts";
import { type AppType } from "./types";

// AppType context adds user and session to the context, will be null if the user or session is null
const app = new Hono<AppType>();

console.log("🔧 Initializing Hono application...");
app.use("*", logger());
app.use("/*", cors());

/** Authentication middleware
 * Extracts session from request headers and attaches user/session to context
 * All routes can access c.get("user") and c.get("session")
 */
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null); // type: typeof auth.$Infer.Session.user | null
  c.set("session", session?.session ?? null); // type: typeof auth.$Infer.Session.session | null
  return next();
});

// Better Auth handler
// Handles all authentication endpoints: /api/auth/sign-in, /api/auth/sign-up, etc.
console.log("🔐 Mounting Better Auth handler at /api/auth/*");
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Serve uploaded images statically
// Files in uploads/ directory are accessible at /uploads/* URLs
console.log("📁 Serving static files from uploads/ directory");
app.use("/uploads/*", serveStatic({ root: "./" }));

// Mount route modules
console.log("📤 Mounting upload routes at /api/upload");
app.route("/api/upload", uploadRouter);

console.log("📝 Mounting sample routes at /api/sample");
app.route("/api/sample", sampleRouter);

console.log("🔮 Mounting readers routes at /api/readers");
app.route("/api/readers", readersRouter);

console.log("📹 Mounting Agora routes at /api/agora");
app.route("/api/agora", agoraRouter);

console.log("💳 Mounting Stripe routes at /api/stripe");
app.route("/api/stripe", stripeRouter);

console.log("💬 Mounting Ably routes at /api/ably");
app.route("/api/ably", ablyRouter);

console.log("👤 Mounting user routes at /api/user");
app.route("/api/user", userRouter);

console.log("👮 Mounting admin routes at /api/admin");
app.route("/api/admin", adminRouter);

console.log("📅 Mounting session routes at /api/sessions");
app.route("/api/sessions", sessionsRouter);

console.log("⭐ Mounting review routes at /api/reviews");
app.route("/api/reviews", reviewsRouter);

console.log("💵 Mounting payout routes at /api/payouts");
app.route("/api/payouts", payoutsRouter);

// Health check endpoint
// Used by load balancers and monitoring tools to verify service is running
app.get("/health", (c) => {
  console.log("💚 Health check requested");
  return c.json({ status: "ok" });
});

// Start the server
console.log("⚙️  Starting server...");
serve({ fetch: app.fetch, port: Number(env.PORT) }, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(`🚀 Server is running on port ${env.PORT}`);
  console.log(`🔗 Base URL: http://localhost:${env.PORT}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📚 Available endpoints:");
  console.log("  🔐 Auth:     /api/auth/*");
  console.log("  👤 User:     /api/user/*");
  console.log("  👮 Admin:    /api/admin/*");
  console.log("  📅 Sessions: /api/sessions/*");
  console.log("  ⭐ Reviews:  /api/reviews/*");
  console.log("  💵 Payouts:  /api/payouts/*");
  console.log("  🔮 Readers:  /api/readers/*");
  console.log("  💳 Stripe:   /api/stripe/*");
  console.log("  📹 Agora:    /api/agora/*");
  console.log("  💬 Ably:     /api/ably/*");
  console.log("  📤 Upload:   /api/upload/*");
  console.log("  💚 Health:   GET /health");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
});
