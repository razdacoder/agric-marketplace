import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/buyer/cart')({ component: CartPage })

function CartPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Cart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        DB-backed cart and Paystack checkout land in Phase 5.
      </p>
    </div>
  )
}
