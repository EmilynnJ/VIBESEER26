import { z } from "zod";

/**
 * Environment variable schema using Zod
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().optional().default("3000"),
  NODE_ENV: z.string().optional(),

  // Database Configuration
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").default("file:dev.db"),

  // Better Auth Configuration
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),

  // Used for Better Auth and for Expo client access
  BACKEND_URL: z.url("BACKEND_URL must be a valid URL").default("http://localhost:3000"), // Set via the Vibecode enviroment at run-time

  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_BACKEND_API_URL: z.string().optional(),
  CLERK_JWKS_URL: z.string().optional(),
  CLERK_JWKS_PUBLIC_KEY: z.string().optional(),

  // Stripe Payments
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),

  // Agora Video Calling
  AGORA_APP_ID: z.string().optional(),
  AGORA_APP_CERTIFICATE: z.string().optional(),

  // Ably Real-time Messaging
  ABLY_API_KEY: z.string().optional(),
});

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:");
      error.issues.forEach((err: any) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      console.error("\nPlease check your .env file and ensure all required variables are set.");
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validated and typed environment variables
 */
export const env = validateEnv();

/**
 * Type of the validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Extend process.env with our environment variables
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
