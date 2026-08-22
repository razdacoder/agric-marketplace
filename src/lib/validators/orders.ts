import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { orderItems, orders } from '#/lib/db/schema'

export const selectOrderSchema = createSelectSchema(orders)
export const selectOrderItemSchema = createSelectSchema(orderItems)

export const insertOrderItemSchema = createInsertSchema(orderItems, {
  quantity: z.number().int().positive(),
}).omit({ id: true, orderId: true, price: true })

export const createOrderSchema = z.object({
  items: z.array(insertOrderItemSchema).min(1, 'Cart is empty'),
})

export type Order = z.infer<typeof selectOrderSchema>
export type OrderItem = z.infer<typeof selectOrderItemSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
