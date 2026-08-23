import { queryOptions } from '@tanstack/react-query'

import {
  getPlatformAnalytics,
  listAllProductsForAdmin,
  listUsers,
} from '#/server/functions/admin'
import type {
  listAdminProductsFiltersSchema,
  listUsersFiltersSchema,
} from '#/lib/validators/admin'
import type { z } from 'zod'

export const adminUsersQueryOptions = (
  filters: z.infer<typeof listUsersFiltersSchema>,
) =>
  queryOptions({
    queryKey: ['admin-users', filters],
    queryFn: () => listUsers({ data: filters }),
  })

export const adminProductsQueryOptions = (
  filters: z.infer<typeof listAdminProductsFiltersSchema>,
) =>
  queryOptions({
    queryKey: ['admin-products', filters],
    queryFn: () => listAllProductsForAdmin({ data: filters }),
  })

export const platformAnalyticsQueryOptions = () =>
  queryOptions({
    queryKey: ['platform-analytics'],
    queryFn: () => getPlatformAnalytics(),
  })
