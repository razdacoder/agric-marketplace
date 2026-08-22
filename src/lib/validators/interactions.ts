import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type { z } from 'zod'

import { userInteractions } from '#/lib/db/schema'

export const selectInteractionSchema = createSelectSchema(userInteractions)

export const insertInteractionSchema = createInsertSchema(userInteractions, {
  value: (schema) => schema.regex(/^\d+(\.\d{1,2})?$/),
}).omit({ id: true, userId: true, createdAt: true })

export type UserInteraction = z.infer<typeof selectInteractionSchema>
export type InsertInteraction = z.infer<typeof insertInteractionSchema>
