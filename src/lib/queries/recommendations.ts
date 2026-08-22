import { queryOptions } from '@tanstack/react-query'

import { getRecommendedProducts } from '#/server/functions/recommendations'

export const recommendedProductsQueryOptions = () =>
  queryOptions({
    queryKey: ['recommended-products'],
    queryFn: () => getRecommendedProducts(),
  })
