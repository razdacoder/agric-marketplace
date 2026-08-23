import { queryOptions } from '@tanstack/react-query'

import {
  getMarketplaceProduct,
  getMarketplaceStats,
  listMarketplaceProducts,
} from '#/server/functions/marketplace'
import type { MarketplaceFilters } from '#/lib/validators/marketplace'

export const marketplaceProductsQueryOptions = (filters: MarketplaceFilters) =>
  queryOptions({
    queryKey: ['marketplace-products', filters],
    queryFn: () => listMarketplaceProducts({ data: filters }),
  })

export const marketplaceProductQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ['marketplace-product', productId],
    queryFn: () => getMarketplaceProduct({ data: { productId } }),
  })

export const marketplaceStatsQueryOptions = () =>
  queryOptions({
    queryKey: ['marketplace-stats'],
    queryFn: () => getMarketplaceStats(),
  })
