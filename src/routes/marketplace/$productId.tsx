import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authClient } from '#/lib/auth-client'
import {
  getMarketplaceProduct,
  recordProductView,
} from '#/server/functions/marketplace'
import { addToCart } from '#/server/functions/cart'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/marketplace/$productId')({
  loader: ({ params }) =>
    getMarketplaceProduct({ data: { productId: params.productId } }),
  errorComponent: () => (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This listing may have been removed or is no longer available.
      </p>
    </div>
  ),
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const product = Route.useLoaderData()
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    void recordProductView({ data: { productId: product.id } })
  }, [product.id])

  return (
    <div className="mx-auto grid max-w-4xl gap-8 p-8 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
          {product.images[activeImage] ? (
            <img
              src={product.images[activeImage]}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        {product.images.length > 1 ? (
          <div className="flex gap-2">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`h-16 w-16 overflow-hidden rounded-md border ${
                  index === activeImage ? 'ring-2 ring-ring' : ''
                }`}
              >
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <Badge variant="outline">{product.category}</Badge>
        </div>
        <p className="text-xl font-semibold">₦{product.price}</p>
        <p className="text-sm text-muted-foreground">
          {product.quantity} available · {product.location}
        </p>
        <p className="text-sm">{product.description}</p>
        <p className="text-sm text-muted-foreground">
          Sold by {product.farmerName}
        </p>
        <AddToCartSection productId={product.id} maxQuantity={product.quantity} />
      </div>
    </div>
  )
}

function AddToCartSection({
  productId,
  maxQuantity,
}: {
  productId: string
  maxQuantity: number
}) {
  const { data: session, isPending } = authClient.useSession()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const mutation = useMutation({
    mutationFn: () => addToCart({ data: { productId, quantity } }),
    onSuccess: () => {
      setAdded(true)
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  if (isPending) return null

  if (!session?.user) {
    return (
      <div className="mt-2">
        <Button asChild variant="outline">
          <Link to="/auth/login">Log in to purchase</Link>
        </Button>
      </div>
    )
  }

  if (session.user.role !== 'buyer') {
    return null
  }

  if (maxQuantity === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">Out of stock.</p>
    )
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <Input
        type="number"
        min={1}
        max={maxQuantity}
        value={quantity}
        onChange={(e) =>
          setQuantity(Math.min(maxQuantity, Math.max(1, Number(e.target.value))))
        }
        className="w-20"
      />
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {added ? 'Added!' : mutation.isPending ? 'Adding…' : 'Add to cart'}
      </Button>
      {added ? (
        <Link to="/buyer/cart" className="text-sm underline">
          View cart
        </Link>
      ) : null}
    </div>
  )
}
