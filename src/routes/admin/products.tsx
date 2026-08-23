import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import { adminProductsQueryOptions } from '#/lib/queries/admin'
import { updateProductStatus } from '#/server/functions/admin'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export const Route = createFileRoute('/admin/products')({
  beforeLoad: requireRole('admin'),
  component: AdminProductsPage,
})

const ALL_STATUSES = '__all__'
type Status = 'pending' | 'approved' | 'suspended'

function AdminProductsPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState(ALL_STATUSES)
  const queryClient = useQueryClient()

  const filters = {
    q: q.trim() || undefined,
    status: status === ALL_STATUSES ? undefined : (status as Status),
  }
  const { data: adminProducts, isLoading } = useQuery(
    adminProductsQueryOptions(filters),
  )

  const statusMutation = useMutation({
    mutationFn: (input: { productId: string; status: Status }) =>
      updateProductStatus({ data: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Moderate listings</h1>

      <div className="mb-6 flex gap-3">
        <Input
          placeholder="Search by title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {adminProducts?.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center justify-between gap-4 pt-6">
              <div>
                <p className="font-medium">
                  {product.title}{' '}
                  <Badge variant="outline" className="ml-2 capitalize">
                    {product.status}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  ₦{product.price} · {product.category} · by{' '}
                  {product.farmerName}
                </p>
              </div>
              <div className="flex gap-2">
                {product.status !== 'approved' ? (
                  <Button
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        productId: product.id,
                        status: 'approved',
                      })
                    }
                  >
                    Approve
                  </Button>
                ) : null}
                {product.status !== 'suspended' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        productId: product.id,
                        status: 'suspended',
                      })
                    }
                  >
                    Suspend
                  </Button>
                ) : null}
                {product.status !== 'pending' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({
                        productId: product.id,
                        status: 'pending',
                      })
                    }
                  >
                    Reset to pending
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
