import { z } from 'zod'

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['farmer', 'buyer', 'admin']),
})

export const setUserBannedSchema = z.object({
  userId: z.string().min(1),
  banned: z.boolean(),
})

export const updateProductStatusSchema = z.object({
  productId: z.uuid(),
  status: z.enum(['pending', 'approved', 'suspended']),
})

export const listUsersFiltersSchema = z.object({
  role: z.enum(['farmer', 'buyer', 'admin']).optional(),
  q: z.string().optional(),
})

export const listAdminProductsFiltersSchema = z.object({
  status: z.enum(['pending', 'approved', 'suspended']).optional(),
  q: z.string().optional(),
})
