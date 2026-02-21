/**
 * Stripe Payment Routes
 *
 * API endpoints for Stripe payment processing.
 * Used to handle payments for psychic reading sessions and balance top-ups.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import Stripe from "stripe";
import { env } from "../env";
import { db } from "../db";
import { type AppType } from "../types";
import { requireAuth } from "../middleware/auth";

export const stripeRouter = new Hono<AppType>();

// Apply auth to payment routes
stripeRouter.use("*", requireAuth);

// Initialize Stripe client
const getStripeClient = (): Stripe | null => {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
  });
};

/**
 * Create payment intent for adding balance
 * POST /api/stripe/add-balance
 */
const addBalanceSchema = z.object({
  amount: z.number().min(5, "Minimum $5").max(1000, "Maximum $1000"),
});

stripeRouter.post("/add-balance", zValidator("json", addBalanceSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return c.json({ error: "Stripe is not configured" }, 503);
    }

    const { amount } = c.req.valid("json");
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      description: `Add $${amount.toFixed(2)} to SoulSeer account balance`,
      metadata: {
        userId: user.id,
        type: "balance_add",
        amount: amount.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`[Stripe] Balance add payment intent created: ${paymentIntent.id}, user: ${user.id}, amount: $${amount}`);

    return c.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
    });
  } catch (error) {
    console.error("[Stripe] Balance add failed:", error);
    return c.json({ error: "Failed to create payment" }, 500);
  }
});

/**
 * Webhook handler for Stripe events
 * POST /api/stripe/webhook
 */
stripeRouter.post("/webhook", async (c) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return c.json({ error: "Stripe is not configured" }, 503);
    }

    const body = await c.req.text();
    const signature = c.req.header("stripe-signature");

    if (!signature) {
      return c.json({ error: "No signature" }, 400);
    }

    // In production, verify webhook signature
    // For now, parse the event directly
    const event = JSON.parse(body);

    console.log(`[Stripe] Webhook received: ${event.type}`);

    // Handle payment intent succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;

      if (metadata.type === "balance_add") {
        const userId = metadata.userId;
        const amount = parseFloat(metadata.amount);

        // Add balance to user account
        const [updatedUser, transaction] = await db.$transaction([
          db.user.update({
            where: { id: userId },
            data: {
              balance: {
                increment: amount,
              },
            },
          }),
          db.transaction.create({
            data: {
              userId,
              type: "BALANCE_ADD",
              amount,
              description: `Added $${amount.toFixed(2)} via Stripe`,
            },
          }),
        ]);

        console.log(`[Stripe] Balance added for user ${userId}: $${amount}, new balance: $${updatedUser.balance}`);
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("[Stripe] Webhook failed:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

/**
 * Create a payment intent
 * POST /api/stripe/create-payment-intent
 */
stripeRouter.post("/create-payment-intent", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return c.json({ error: "Stripe is not configured" }, 503);
    }

    const body = await c.req.json();
    const { amount, currency = "usd", description, metadata = {} } = body;

    if (!amount || amount < 50) {
      return c.json({ error: "Amount must be at least 50 cents" }, 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata: {
        ...metadata,
        userId: user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`[Stripe] Payment intent created: ${paymentIntent.id}, user: ${user.id}`);

    return c.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("[Stripe] Payment intent creation failed:", error);
    return c.json({ error: "Failed to create payment intent" }, 500);
  }
});

/**
 * Create a customer
 * POST /api/stripe/create-customer
 *
 * Request body:
 * - email: string - Customer email
 * - name?: string - Customer name
 */
stripeRouter.post("/create-customer", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return c.json({ error: "Stripe is not configured" }, 503);
    }

    const body = await c.req.json();
    const { email, name } = body;

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: user.id,
      },
    });

    console.log(`[Stripe] Customer created: ${customer.id}, user: ${user.id}`);

    return c.json({
      customerId: customer.id,
    });
  } catch (error) {
    console.error("[Stripe] Customer creation failed:", error);
    return c.json({ error: "Failed to create customer" }, 500);
  }
});

/**
 * Get payment methods for a customer
 * GET /api/stripe/payment-methods/:customerId
 */
stripeRouter.get("/payment-methods/:customerId", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return c.json({ error: "Stripe is not configured" }, 503);
    }

    const customerId = c.req.param("customerId");

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return c.json({
      paymentMethods: paymentMethods.data,
    });
  } catch (error) {
    console.error("[Stripe] Failed to get payment methods:", error);
    return c.json({ error: "Failed to get payment methods" }, 500);
  }
});

/**
 * Check Stripe configuration status
 * GET /api/stripe/status
 */
stripeRouter.get("/status", async (c) => {
  const isConfigured = !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY);

  return c.json({
    configured: isConfigured,
    publishableKey: isConfigured ? env.STRIPE_PUBLISHABLE_KEY : undefined,
  });
});
