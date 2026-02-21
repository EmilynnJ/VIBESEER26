/**
 * Stripe Payment Client
 *
 * This module provides Stripe payment integration for the SoulSeer app.
 * Used for processing payments for psychic reading sessions.
 */

// Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = (): boolean => {
  return !!STRIPE_PUBLISHABLE_KEY;
};

/**
 * Get the Stripe publishable key
 */
export const getStripePublishableKey = (): string | undefined => {
  return STRIPE_PUBLISHABLE_KEY;
};

/**
 * Stripe payment configuration
 */
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  merchantIdentifier: "merchant.com.soulseerpsychics",
  urlScheme: "vibecode",
};

// Log configuration status
if (isStripeConfigured()) {
  console.log("[StripeClient] Stripe is configured and ready");
} else {
  console.log("[StripeClient] Stripe is not configured - payment features will be limited");
}

export { STRIPE_PUBLISHABLE_KEY };
