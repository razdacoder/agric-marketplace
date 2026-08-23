import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/lib/db'
import { products, user, userInteractions } from '#/lib/db/schema'
import { marketplaceFiltersSchema } from '#/lib/validators/marketplace'
import { getRatingStatsForProducts } from '#/server/functions/rating-stats'
import { getServerSession } from '#/server/functions/session'

export const listMarketplaceProducts = createServerFn({ method: 'GET' })
  .validator(marketplaceFiltersSchema)
  .handler(async ({ data }) => {
    const conditions = [eq(products.status, 'approved')]

    if (data.q) {
      conditions.push(
        or(
          ilike(products.title, `%${data.q}%`),
          ilike(products.description, `%${data.q}%`),
        )!,
      )
    }
    if (data.category) conditions.push(eq(products.category, data.category))
    if (data.minPrice !== undefined) {
      conditions.push(gte(products.price, data.minPrice.toFixed(2)))
    }
    if (data.maxPrice !== undefined) {
      conditions.push(lte(products.price, data.maxPrice.toFixed(2)))
    }
    if (data.location) {
      conditions.push(ilike(products.location, `%${data.location}%`))
    }

    const where = and(...conditions)

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(products)
        .where(where)
        .orderBy(desc(products.createdAt))
        .limit(data.pageSize)
        .offset((data.page - 1) * data.pageSize),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(where),
    ])

    const ratingStats = await getRatingStatsForProducts(
      items.map((item) => item.id),
    )
    const itemsWithRatings = items.map((item) => ({
      ...item,
      rating: ratingStats.get(item.id) ?? { average: 0, count: 0 },
    }))

    return {
      items: itemsWithRatings,
      total: count,
      page: data.page,
      pageSize: data.pageSize,
    }
  })

export const getMarketplaceProduct = createServerFn({ method: 'GET' })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }) => {
    const rows = await db
      .select({
        product: products,
        farmerName: user.name,
      })
      .from(products)
      .innerJoin(user, eq(products.farmerId, user.id))
      .where(
        and(eq(products.id, data.productId), eq(products.status, 'approved')),
      )

    const row = rows.at(0)

    if (!row) {
      throw new Error('Product not found')
    }

    const ratingStats = await getRatingStatsForProducts([row.product.id])

    return {
      ...row.product,
      farmerName: row.farmerName,
      rating: ratingStats.get(row.product.id) ?? { average: 0, count: 0 },
    }
  })

export const getMarketplaceStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    const [{ productCount, farmerCount, categoryCount }] = await db
      .select({
        productCount: sql<number>`count(*)::int`,
        farmerCount: sql<number>`count(distinct ${products.farmerId})::int`,
        categoryCount: sql<number>`count(distinct ${products.category})::int`,
      })
      .from(products)
      .where(eq(products.status, 'approved'))

    return { productCount, farmerCount, categoryCount }
  },
)

export const recordProductView = createServerFn({ method: 'POST' })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }) => {
    const session = await getServerSession()

    if (!session) return

    await db.insert(userInteractions).values({
      userId: session.user.id,
      productId: data.productId,
      type: 'view',
    })
  })
