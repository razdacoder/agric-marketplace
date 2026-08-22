import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { products } from '#/lib/db/schema'
import { insertProductSchema, updateProductSchema } from '#/lib/validators/products'
import { requireServerRole } from '#/server/functions/session'

async function requireOwnedProduct(productId: string, farmerId: string) {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.farmerId, farmerId)))

  const product = rows.at(0)

  if (!product) {
    throw new Error('Product not found')
  }

  return product
}

export const listFarmerProducts = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await requireServerRole('farmer')

    return db
      .select()
      .from(products)
      .where(eq(products.farmerId, session.user.id))
      .orderBy(desc(products.createdAt))
  },
)

export const getFarmerProduct = createServerFn({ method: 'GET' })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }) => {
    const session = await requireServerRole('farmer')
    return requireOwnedProduct(data.productId, session.user.id)
  })

export const createProduct = createServerFn({ method: 'POST' })
  .validator(insertProductSchema)
  .handler(async ({ data }) => {
    const session = await requireServerRole('farmer')

    const [product] = await db
      .insert(products)
      .values({ ...data, farmerId: session.user.id })
      .returning()

    return product
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .validator(
    z.object({ productId: z.uuid(), data: updateProductSchema }),
  )
  .handler(async ({ data }) => {
    const session = await requireServerRole('farmer')
    await requireOwnedProduct(data.productId, session.user.id)

    const [product] = await db
      .update(products)
      .set({ ...data.data, updatedAt: new Date() })
      .where(eq(products.id, data.productId))
      .returning()

    return product
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }) => {
    const session = await requireServerRole('farmer')
    await requireOwnedProduct(data.productId, session.user.id)

    await db.delete(products).where(eq(products.id, data.productId))
  })
