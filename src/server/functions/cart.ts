import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { cartItems, products } from '#/lib/db/schema'
import { requireServerRole } from '#/server/functions/session'

export const getCart = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await requireServerRole('buyer')

  const rows = await db
    .select({ cartItem: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, session.user.id))

  const items = rows.map((row) => ({ ...row.cartItem, product: row.product }))
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  )

  return { items, subtotal }
})

export const addToCart = createServerFn({ method: 'POST' })
  .validator(
    z.object({ productId: z.uuid(), quantity: z.number().int().positive().default(1) }),
  )
  .handler(async ({ data }) => {
    const session = await requireServerRole('buyer')

    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.id, data.productId))
    const product = productRows.at(0)

    if (!product || product.status !== 'approved') {
      throw new Error('Product not found')
    }

    const existingRows = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, session.user.id),
          eq(cartItems.productId, data.productId),
        ),
      )
    const existing = existingRows.at(0)

    const desiredQuantity = (existing ? existing.quantity : 0) + data.quantity
    const cappedQuantity = Math.min(desiredQuantity, product.quantity)

    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: cappedQuantity })
        .where(eq(cartItems.id, existing.id))
    } else {
      await db.insert(cartItems).values({
        userId: session.user.id,
        productId: data.productId,
        quantity: cappedQuantity,
      })
    }
  })

async function requireOwnedCartItem(cartItemId: string, userId: string) {
  const rows = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)))
  const cartItem = rows.at(0)

  if (!cartItem) {
    throw new Error('Cart item not found')
  }

  return cartItem
}

export const updateCartItemQuantity = createServerFn({ method: 'POST' })
  .validator(z.object({ cartItemId: z.uuid(), quantity: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const session = await requireServerRole('buyer')
    await requireOwnedCartItem(data.cartItemId, session.user.id)

    await db
      .update(cartItems)
      .set({ quantity: data.quantity })
      .where(eq(cartItems.id, data.cartItemId))
  })

export const removeFromCart = createServerFn({ method: 'POST' })
  .validator(z.object({ cartItemId: z.uuid() }))
  .handler(async ({ data }) => {
    const session = await requireServerRole('buyer')
    await requireOwnedCartItem(data.cartItemId, session.user.id)

    await db.delete(cartItems).where(eq(cartItems.id, data.cartItemId))
  })
