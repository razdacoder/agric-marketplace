import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { orderItems, orders, reviews, user, userInteractions } from '#/lib/db/schema'
import { requireServerRole } from '#/server/functions/session'

async function hasPurchased(buyerId: string, productId: string) {
  const rows = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.buyerId, buyerId),
        eq(orderItems.productId, productId),
        inArray(orders.status, ['paid', 'shipped', 'completed']),
      ),
    )

  return rows.length > 0
}

export const listProductReviews = createServerFn({ method: 'GET' })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }) => {
    const rows = await db
      .select({ review: reviews, buyerName: user.name })
      .from(reviews)
      .innerJoin(user, eq(reviews.buyerId, user.id))
      .where(eq(reviews.productId, data.productId))
      .orderBy(desc(reviews.createdAt))

    const items = rows.map((row) => ({ ...row.review, buyerName: row.buyerName }))
    const average =
      items.length === 0
        ? 0
        : items.reduce((sum, item) => sum + item.rating, 0) / items.length

    return { items, average, count: items.length }
  })

export const getReviewEligibility = createServerFn({ method: 'GET' })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }) => {
    const session = await requireServerRole('buyer')

    const [purchased, myReviewRows] = await Promise.all([
      hasPurchased(session.user.id, data.productId),
      db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.buyerId, session.user.id),
            eq(reviews.productId, data.productId),
          ),
        ),
    ])

    return { purchased, myReview: myReviewRows.at(0) ?? null }
  })

export const submitReview = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      productId: z.uuid(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await requireServerRole('buyer')

    const purchased = await hasPurchased(session.user.id, data.productId)
    if (!purchased) {
      throw new Error('You can only review products you have purchased')
    }

    await db
      .insert(reviews)
      .values({
        buyerId: session.user.id,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
      })
      .onConflictDoUpdate({
        target: [reviews.buyerId, reviews.productId],
        set: { rating: data.rating, comment: data.comment },
      })

    await db.insert(userInteractions).values({
      userId: session.user.id,
      productId: data.productId,
      type: 'rating',
      value: data.rating.toFixed(2),
    })
  })
