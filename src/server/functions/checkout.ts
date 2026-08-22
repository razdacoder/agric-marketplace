import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { cartItems, orderItems, orders, products, userInteractions } from '#/lib/db/schema'
import { initializeTransaction, verifyTransaction } from '#/lib/paystack'
import { requireServerRole } from '#/server/functions/session'

export const initializeCheckout = createServerFn({ method: 'POST' }).handler(
  async () => {
    const session = await requireServerRole('buyer')

    const rows = await db
      .select({ cartItem: cartItems, product: products })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, session.user.id))

    if (rows.length === 0) {
      throw new Error('Your cart is empty')
    }

    for (const row of rows) {
      if (row.cartItem.quantity > row.product.quantity) {
        throw new Error(`Not enough stock left for "${row.product.title}"`)
      }
    }

    const total = rows.reduce(
      (sum, row) => sum + Number(row.product.price) * row.cartItem.quantity,
      0,
    )

    const insertedOrders = await db
      .insert(orders)
      .values({ buyerId: session.user.id, total: total.toFixed(2) })
      .returning()
    const order = insertedOrders.at(0)

    if (!order) {
      throw new Error('Could not create order')
    }

    await db.insert(orderItems).values(
      rows.map((row) => ({
        orderId: order.id,
        productId: row.product.id,
        quantity: row.cartItem.quantity,
        price: row.product.price,
      })),
    )

    const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

    const { authorizationUrl, reference } = await initializeTransaction({
      email: session.user.email,
      amountKobo: Math.round(total * 100),
      callbackUrl: `${baseUrl}/buyer/checkout/callback`,
      metadata: { orderId: order.id },
    })

    await db
      .update(orders)
      .set({ paymentRef: reference })
      .where(eq(orders.id, order.id))

    return { authorizationUrl }
  },
)

export const verifyPayment = createServerFn({ method: 'POST' })
  .validator(z.object({ reference: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await requireServerRole('buyer')

    const orderRows = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.paymentRef, data.reference),
          eq(orders.buyerId, session.user.id),
        ),
      )
    const order = orderRows.at(0)

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status === 'paid') {
      return { status: 'paid' as const }
    }

    const result = await verifyTransaction(data.reference)

    if (!result.success) {
      await db
        .update(orders)
        .set({ status: 'cancelled' })
        .where(eq(orders.id, order.id))
      return { status: 'failed' as const }
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))

    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({ status: 'paid' })
        .where(eq(orders.id, order.id))

      for (const item of items) {
        await tx
          .update(products)
          .set({
            quantity: sql`greatest(${products.quantity} - ${item.quantity}, 0)`,
          })
          .where(eq(products.id, item.productId))
      }

      await tx.insert(userInteractions).values(
        items.map((item) => ({
          userId: session.user.id,
          productId: item.productId,
          type: 'purchase' as const,
          value: item.quantity.toFixed(2),
        })),
      )

      await tx.delete(cartItems).where(eq(cartItems.userId, session.user.id))
    })

    console.log(
      `[orders] Confirmation email for ${session.user.email}: order ${order.id} paid, total ₦${order.total}`,
    )

    return { status: 'paid' as const }
  })

export const listBuyerOrders = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await requireServerRole('buyer')

    const buyerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, session.user.id))
      .orderBy(desc(orders.createdAt))

    if (buyerOrders.length === 0) return []

    const items = await db
      .select({ orderItem: orderItems, product: products })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        inArray(
          orderItems.orderId,
          buyerOrders.map((order) => order.id),
        ),
      )

    return buyerOrders.map((order) => ({
      ...order,
      items: items
        .filter((row) => row.orderItem.orderId === order.id)
        .map((row) => ({ ...row.orderItem, product: row.product })),
    }))
  },
)
