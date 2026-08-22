import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import { farmerProductsQueryOptions } from '#/lib/queries/farmer-products'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/farmer/dashboard')({
  beforeLoad: requireRole('farmer'),
  component: FarmerDashboardPage,
})

function FarmerDashboardPage() {
  const { data: products } = useQuery(farmerProductsQueryOptions)
  const approved = products?.filter((p) => p.status === 'approved').length ?? 0
  const pending = products?.filter((p) => p.status === 'pending').length ?? 0

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Farmer dashboard</h1>
        <Button asChild variant="outline">
          <Link to="/farmer/products">Manage listings</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total listings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {products?.length ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {approved}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Pending review
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {pending}
          </CardContent>
        </Card>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Sales metrics land in Phase 5 once orders exist.
      </p>
    </div>
  )
}
