import { queryOptions } from '@tanstack/react-query'

import {
  getReviewEligibility,
  listProductReviews,
} from '#/server/functions/reviews'

export const productReviewsQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ['product-reviews', productId],
    queryFn: () => listProductReviews({ data: { productId } }),
  })

export const reviewEligibilityQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ['review-eligibility', productId],
    queryFn: () => getReviewEligibility({ data: { productId } }),
  })
