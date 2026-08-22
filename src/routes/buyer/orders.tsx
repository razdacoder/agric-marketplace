import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/buyer/orders')({
  component: OrdersPage,
})

function OrdersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">My orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order tracking lands in Phase 5 (cart &amp; checkout).
      </p>
    </div>
  )
}
