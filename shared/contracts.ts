// contracts.ts
// Shared API contracts (schemas and types) used by both the server and the app.
// Import in the app as: `import { type GetSampleResponse } from "@shared/contracts"`
// Import in the server as: `import { postSampleRequestSchema } from "@shared/contracts"`

import { z } from "zod";

// GET /api/sample
export const getSampleResponseSchema = z.object({
  message: z.string(),
});
export type GetSampleResponse = z.infer<typeof getSampleResponseSchema>;

// POST /api/sample
export const postSampleRequestSchema = z.object({
  value: z.string(),
});
export type PostSampleRequest = z.infer<typeof postSampleRequestSchema>;
export const postSampleResponseSchema = z.object({
  message: z.string(),
});
export type PostSampleResponse = z.infer<typeof postSampleResponseSchema>;

// POST /api/upload/image
export const uploadImageRequestSchema = z.object({
  image: z.instanceof(File),
});
export type UploadImageRequest = z.infer<typeof uploadImageRequestSchema>;
export const uploadImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  url: z.string(),
  filename: z.string(),
});
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

// ============================================
// SoulSeer API Contracts
// ============================================

// GET /api/readers - Get all readers
export const getReadersResponseSchema = z.object({
  readers: z.array(
    z.object({
      id: z.number(),
      userId: z.string(),
      displayName: z.string(),
      bio: z.string().nullable(),
      specialties: z.array(z.string()).nullable(),
      yearsExperience: z.number().nullable(),
      profileImage: z.string().nullable(),
      isOnline: z.boolean(),
      isAvailable: z.boolean(),
      chatRatePerMin: z.number(),
      phoneRatePerMin: z.number(),
      videoRatePerMin: z.number(),
      rating: z.number().nullable(),
      totalReviews: z.number(),
      totalSessions: z.number(),
    })
  ),
});
export type GetReadersResponse = z.infer<typeof getReadersResponseSchema>;

// GET /api/readers/:id - Get reader by ID
export const getReaderByIdResponseSchema = z.object({
  reader: z.object({
    id: z.number(),
    userId: z.string(),
    displayName: z.string(),
    bio: z.string().nullable(),
    specialties: z.array(z.string()).nullable(),
    yearsExperience: z.number().nullable(),
    profileImage: z.string().nullable(),
    isOnline: z.boolean(),
    isAvailable: z.boolean(),
    chatRatePerMin: z.number(),
    phoneRatePerMin: z.number(),
    videoRatePerMin: z.number(),
    rating: z.number().nullable(),
    totalReviews: z.number(),
    totalSessions: z.number(),
  }),
  reviews: z.array(
    z.object({
      id: z.number(),
      rating: z.number(),
      comment: z.string().nullable(),
      createdAt: z.string(),
      user: z.object({
        name: z.string().nullable(),
      }),
    })
  ),
});
export type GetReaderByIdResponse = z.infer<typeof getReaderByIdResponseSchema>;
