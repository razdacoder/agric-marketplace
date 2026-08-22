import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from '#/server/functions/cart'
import { initializeCheckout } from '#/server/functions/checkout'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'

const cartQueryOptions = {
  queryKey: ['cart'],
  queryFn: () => getCart(),
}

export const Route = createFileRoute('/buyer/cart')({
  beforeLoad: requireRole('buyer'),
  component: CartPage,
})

function CartPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(cartQueryOptions)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)

  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: ['cart'] })

  const updateMutation = useMutation({
    mutationFn: (input: { cartItemId: string; quantity: number }) =>
      updateCartItemQuantity({ data: input }),
    onSuccess: invalidateCart,
  })

  const removeMutation = useMutation({
    mutationFn: (cartItemId: string) => removeFromCart({ data: { cartItemId } }),
    onSuccess: invalidateCart,
  })

  async function handleCheckout() {
    setCheckoutError(null)
    setCheckingOut(true)
    try {
      const { authorizationUrl } = await initializeCheckout()
      window.location.href = authorizationUrl
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : 'Checkout failed',
      )
      setCheckingOut(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Cart</h1>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : null}

      {!isLoading && data?.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {data?.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between gap-4 pt-4">
              <div>
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-muted-foreground">
                  ₦{item.product.price} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={item.quantity <= 1}
                  onClick={() =>
                    updateMutation.mutate({
                      cartItemId: item.id,
                      quantity: item.quantity - 1,
                    })
                  }
                >
                  -
                </Button>
                <span className="w-6 text-center text-sm">
                  {item.quantity}
                </span>
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={item.quantity >= item.product.quantity}
                  onClick={() =>
                    updateMutation.mutate({
                      cartItemId: item.id,
                      quantity: item.quantity + 1,
                    })
                  }
                >
                  +
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeMutation.mutate(item.id)}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.items.length > 0 ? (
        <div className="mt-6 flex flex-col items-end gap-3">
          <p className="text-lg font-semibold">
            Subtotal: ₦{data.subtotal.toFixed(2)}
          </p>
          {checkoutError ? (
            <p className="text-sm text-destructive">{checkoutError}</p>
          ) : null}
          <Button onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? 'Redirecting…' : 'Proceed to checkout'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
