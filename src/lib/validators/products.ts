import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { products } from '#/lib/db/schema'

export const productCategories = [
  'grains',
  'vegetables',
  'fruits',
  'livestock',
  'dairy',
  'poultry',
  'fisheries',
  'other',
] as const

export const selectProductSchema = createSelectSchema(products)

export const insertProductSchema = createInsertSchema(products, {
  title: (schema) => schema.min(3).max(120),
  description: (schema) => schema.min(10).max(4000),
  price: (schema) => schema.regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price'),
  quantity: z.number().int().nonnegative(),
  location: (schema) => schema.min(2).max(120),
  images: z.array(z.string().url()).max(8),
}).omit({
  id: true,
  farmerId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
})

export const updateProductSchema = insertProductSchema.partial()

export type Product = z.infer<typeof selectProductSchema>
export type InsertProduct = z.infer<typeof insertProductSchema>
export type UpdateProduct = z.infer<typeof updateProductSchema>
