import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '#/lib/db'
import { products, userInteractions } from '#/lib/db/schema'
import {
  buildInteractionScores,
  popularityRank,
  recommend,
} from '#/lib/recommendations/engine'
import type { Interaction } from '#/lib/recommendations/engine'
import { getRatingStatsForProducts } from '#/server/functions/rating-stats'
import { requireServerRole } from '#/server/functions/session'

const RECOMMENDATION_LIMIT = 8

export const getRecommendedProducts = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await requireServerRole('buyer')

    const [interactionRows, approvedProducts] = await Promise.all([
      db.select().from(userInteractions),
      db.select().from(products).where(eq(products.status, 'approved')),
    ])

    const interactions: Array<Interaction> = interactionRows.map((row) => ({
      userId: row.userId,
      productId: row.productId,
      type: row.type,
      value: Number(row.value),
    }))

    const matrix = buildInteractionScores(interactions)

    const purchasedProductIds = new Set(
      interactions
        .filter((i) => i.userId === session.user.id && i.type === 'purchase')
        .map((i) => i.productId),
    )

    const candidateProducts = approvedProducts.filter(
      (product) => !purchasedProductIds.has(product.id),
    )
    const candidateIds = candidateProducts.map((product) => product.id)

    const ratingStats = await getRatingStatsForProducts(
      approvedProducts.map((product) => product.id),
    )

    const cfResults = recommend({
      targetUserId: session.user.id,
      matrix,
      candidateIds,
      limit: RECOMMENDATION_LIMIT,
    })

    const byId = new Map(candidateProducts.map((product) => [product.id, product]))
    const recommended = cfResults
      .map((result) => {
        const product = byId.get(result.productId)
        if (!product) return null
        return {
          ...product,
          rating: ratingStats.get(product.id) ?? { average: 0, count: 0 },
          strategy: result.strategy,
        }
      })
      .filter((item) => item !== null)

    if (recommended.length >= RECOMMENDATION_LIMIT) {
      return recommended
    }

    const usedIds = new Set(recommended.map((item) => item.id))
    const popular = popularityRank(
      candidateProducts
        .filter((product) => !usedIds.has(product.id))
        .map((product) => ({
          ...product,
          rating: ratingStats.get(product.id) ?? { average: 0, count: 0 },
        })),
    ).map((product) => ({ ...product, strategy: 'popular' as const }))

    return [
      ...recommended,
      ...popular.slice(0, RECOMMENDATION_LIMIT - recommended.length),
    ]
  },
)
