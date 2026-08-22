import { createFileRoute, Link } from '@tanstack/react-router'

import { requireRole } from '#/lib/route-guards'
import { listBuyerOrders } from '#/server/functions/checkout'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/buyer/orders')({
  beforeLoad: requireRole('buyer'),
  loader: () => listBuyerOrders(),
  component: OrdersPage,
})

function OrdersPage() {
  const orders = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">My orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t placed any orders yet.
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Order {order.id.slice(0, 8)}
                </CardTitle>
                <Badge variant="outline">{order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm text-muted-foreground"
                >
                  <span>
                    {item.product.title} × {item.quantity}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>₦{item.price}</span>
                    {order.status === 'paid' ||
                    order.status === 'shipped' ||
                    order.status === 'completed' ? (
                      <Link
                        to="/marketplace/$productId"
                        params={{ productId: item.product.id }}
                        className="text-xs underline"
                      >
                        Rate this product
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
              <p className="mt-2 text-right font-semibold">
                Total: ₦{order.total}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
