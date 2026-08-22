import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { reviews } from '#/lib/db/schema'

export const selectReviewSchema = createSelectSchema(reviews)

export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.number().int().min(1).max(5),
  comment: (schema) => schema.max(2000).optional(),
}).omit({ id: true, buyerId: true, createdAt: true })

export type Review = z.infer<typeof selectReviewSchema>
export type InsertReview = z.infer<typeof insertReviewSchema>
