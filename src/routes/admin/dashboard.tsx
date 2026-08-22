import { createFileRoute } from '@tanstack/react-router'

import { requireRole } from '#/lib/route-guards'

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: requireRole('admin'),
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        User management, listing moderation, and analytics land in Phase 8.
      </p>
    </div>
  )
}
