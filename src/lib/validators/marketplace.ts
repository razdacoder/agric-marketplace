import { z } from 'zod'

import { productCategories } from '#/lib/validators/products'

export const marketplaceFiltersSchema = z.object({
  q: z.string().trim().min(1).optional(),
  category: z.enum(productCategories).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  location: z.string().trim().min(1).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(48).default(12),
})

export type MarketplaceFilters = z.infer<typeof marketplaceFiltersSchema>
