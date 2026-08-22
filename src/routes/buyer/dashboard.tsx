import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import { recommendedProductsQueryOptions } from '#/lib/queries/recommendations'
import { MarketplaceProductCard } from '#/components/products/marketplace-product-card'

const STRATEGY_CAPTIONS: Record<string, string> = {
  'user-cf': 'Because buyers like you liked this',
  'item-cf': "Similar to what you've bought",
  popular: 'Popular right now',
}

export const Route = createFileRoute('/buyer/dashboard')({
  beforeLoad: requireRole('buyer'),
  component: BuyerDashboardPage,
})

function BuyerDashboardPage() {
  const { data: recommendations, isLoading } = useQuery(
    recommendedProductsQueryOptions(),
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Buyer dashboard</h1>
      <h2 className="mt-6 mb-4 text-lg font-semibold">Recommended for you</h2>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : null}

      {!isLoading && recommendations?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Browse the marketplace to get personalized picks.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations?.map((product) => (
          <div key={product.id} className="flex flex-col gap-1">
            <MarketplaceProductCard product={product} />
            <p className="text-xs text-muted-foreground">
              {STRATEGY_CAPTIONS[product.strategy]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
