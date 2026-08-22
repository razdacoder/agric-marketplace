import { inArray, sql } from 'drizzle-orm'

import { db } from '#/lib/db'
import { reviews } from '#/lib/db/schema'

export async function getRatingStatsForProducts(productIds: Array<string>) {
  if (productIds.length === 0) return new Map<string, { average: number; count: number }>()

  const rows = await db
    .select({
      productId: reviews.productId,
      average: sql<string>`avg(${reviews.rating})`,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(inArray(reviews.productId, productIds))
    .groupBy(reviews.productId)

  return new Map(
    rows.map((row) => [
      row.productId,
      { average: Number(row.average), count: row.count },
    ]),
  )
}
