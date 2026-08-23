import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import { platformAnalyticsQueryOptions } from '#/lib/queries/admin'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: requireRole('admin'),
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { data, isLoading } = useQuery(platformAnalyticsQueryOptions())

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/users">Manage users</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/products">Moderate listings</Link>
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Users by role
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                {data.usersByRole.map((row) => (
                  <div key={row.role} className="flex justify-between">
                    <span className="capitalize">{row.role}</span>
                    <span className="font-semibold">{row.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Listings by status
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                {data.productsByStatus.map((row) => (
                  <div key={row.status} className="flex justify-between">
                    <span className="capitalize">{row.status}</span>
                    <span className="font-semibold">{row.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Orders & revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>Paid orders</span>
                  <span className="font-semibold">{data.orderCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue</span>
                  <span className="font-semibold">₦{data.revenue}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Top products by units sold
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              {data.topProducts.length === 0 ? (
                <p className="text-muted-foreground">No sales yet.</p>
              ) : null}
              {data.topProducts.map((row) => (
                <div key={row.productId} className="flex justify-between">
                  <span>{row.title}</span>
                  <span className="font-semibold">{row.totalQuantity} sold</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
