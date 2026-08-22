import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import { farmerProductsQueryOptions } from '#/lib/queries/farmer-products'
import { deleteProduct } from '#/server/functions/products'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/farmer/products/')({
  beforeLoad: requireRole('farmer'),
  component: FarmerProductsPage,
})

function FarmerProductsPage() {
  const queryClient = useQueryClient()
  const { data: products, isLoading } = useQuery(farmerProductsQueryOptions)

  const deleteMutation = useMutation({
    mutationFn: (productId: string) =>
      deleteProduct({ data: { productId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['farmer-products'] })
    },
  })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My products</h1>
        <Button asChild>
          <Link to="/farmer/products/new">New product</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : null}

      {!isLoading && products?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t listed any products yet.
        </p>
      ) : null}

      {deleteMutation.isError ? (
        <p className="mb-4 text-sm text-destructive">
          Couldn&apos;t delete that product — it may already be part of an
          order.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{product.title}</CardTitle>
                <Badge variant="outline">{product.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <p className="text-sm font-medium">
                ₦{product.price} · {product.quantity} in stock
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link
                    to="/farmer/products/$productId"
                    params={{ productId: product.id }}
                  >
                    Edit
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(product.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
