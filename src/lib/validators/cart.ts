import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { cartItems } from '#/lib/db/schema'

export const selectCartItemSchema = createSelectSchema(cartItems)

export const insertCartItemSchema = createInsertSchema(cartItems, {
  quantity: z.number().int().positive().max(999),
}).omit({ id: true, userId: true })

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(999),
})

export type CartItem = z.infer<typeof selectCartItemSchema>
export type InsertCartItem = z.infer<typeof insertCartItemSchema>
