import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import {
  getMarketplaceProduct,
  recordProductView,
} from '#/server/functions/marketplace'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

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
        <div className="mt-2 flex flex-col gap-1">
          <Button disabled>Add to cart</Button>
          <p className="text-xs text-muted-foreground">
            Cart &amp; checkout land in Phase 5.
          </p>
        </div>
      </div>
    </div>
  )
}
