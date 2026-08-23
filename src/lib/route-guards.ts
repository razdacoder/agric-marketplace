import { redirect } from '@tanstack/react-router'

export type Role = 'farmer' | 'buyer' | 'admin'

const dashboardPathByRole: Record<Role, string> = {
  farmer: '/farmer/dashboard',
  buyer: '/buyer/dashboard',
  admin: '/admin/dashboard',
}

interface RouteGuardContext {
  user: { role: string; banned?: boolean | null } | null
}

export function requireRole(...roles: Array<Role>) {
  return ({ context }: { context: RouteGuardContext }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/login' })
    }

    if (context.user.banned) {
      throw redirect({ to: '/account-suspended' })
    }

    const userRole = context.user.role as Role

    if (!roles.includes(userRole)) {
      throw redirect({ to: dashboardPathByRole[userRole] })
    }
  }
}
