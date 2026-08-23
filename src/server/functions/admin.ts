import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'

import { db } from '#/lib/db'
import { orderItems, orders, products, user } from '#/lib/db/schema'
import {
  listAdminProductsFiltersSchema,
  listUsersFiltersSchema,
  setUserBannedSchema,
  updateProductStatusSchema,
  updateUserRoleSchema,
} from '#/lib/validators/admin'
import { requireServerRole } from '#/server/functions/session'

export const listUsers = createServerFn({ method: 'GET' })
  .validator(listUsersFiltersSchema)
  .handler(async ({ data }) => {
    await requireServerRole('admin')

    const conditions = []
    if (data.role) conditions.push(eq(user.role, data.role))
    if (data.q) {
      conditions.push(
        or(ilike(user.name, `%${data.q}%`), ilike(user.email, `%${data.q}%`))!,
      )
    }

    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        banned: user.banned,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(user.createdAt))
  })

export const updateUserRole = createServerFn({ method: 'POST' })
  .validator(updateUserRoleSchema)
  .handler(async ({ data }) => {
    const session = await requireServerRole('admin')

    if (data.userId === session.user.id) {
      throw new Error('You cannot change your own role')
    }

    await db.update(user).set({ role: data.role }).where(eq(user.id, data.userId))
  })

export const setUserBanned = createServerFn({ method: 'POST' })
  .validator(setUserBannedSchema)
  .handler(async ({ data }) => {
    const session = await requireServerRole('admin')

    if (data.userId === session.user.id) {
      throw new Error('You cannot suspend your own account')
    }

    await db
      .update(user)
      .set({ banned: data.banned })
      .where(eq(user.id, data.userId))
  })

export const listAllProductsForAdmin = createServerFn({ method: 'GET' })
  .validator(listAdminProductsFiltersSchema)
  .handler(async ({ data }) => {
    await requireServerRole('admin')

    const conditions = []
    if (data.status) conditions.push(eq(products.status, data.status))
    if (data.q) conditions.push(ilike(products.title, `%${data.q}%`))

    const rows = await db
      .select({ product: products, farmerName: user.name })
      .from(products)
      .innerJoin(user, eq(products.farmerId, user.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.createdAt))

    return rows.map((row) => ({ ...row.product, farmerName: row.farmerName }))
  })

export const updateProductStatus = createServerFn({ method: 'POST' })
  .validator(updateProductStatusSchema)
  .handler(async ({ data }) => {
    await requireServerRole('admin')

    await db
      .update(products)
      .set({ status: data.status })
      .where(eq(products.id, data.productId))
  })

export const getPlatformAnalytics = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireServerRole('admin')

    const [usersByRole, productsByStatus, orderStats, topProducts] =
      await Promise.all([
        db
          .select({ role: user.role, count: sql<number>`count(*)::int` })
          .from(user)
          .groupBy(user.role),
        db
          .select({ status: products.status, count: sql<number>`count(*)::int` })
          .from(products)
          .groupBy(products.status),
        db
          .select({
            count: sql<number>`count(*)::int`,
            revenue: sql<string>`coalesce(sum(${orders.total}), 0)`,
          })
          .from(orders)
          .where(inArray(orders.status, ['paid', 'shipped', 'completed'])),
        db
          .select({
            productId: orderItems.productId,
            title: products.title,
            totalQuantity: sql<number>`sum(${orderItems.quantity})::int`,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(inArray(orders.status, ['paid', 'shipped', 'completed']))
          .groupBy(orderItems.productId, products.title)
          .orderBy(desc(sql`sum(${orderItems.quantity})`))
          .limit(5),
      ])

    return {
      usersByRole,
      productsByStatus,
      orderCount: orderStats.at(0)?.count ?? 0,
      revenue: orderStats.at(0)?.revenue ?? '0',
      topProducts,
    }
  },
)
