import { queryOptions } from '@tanstack/react-query'

import { listFarmerProducts } from '#/server/functions/products'

export const farmerProductsQueryOptions = queryOptions({
  queryKey: ['farmer-products'],
  queryFn: () => listFarmerProducts(),
})
