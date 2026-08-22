import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/marketplace/$productId')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { productId } = Route.useParams()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Product {productId}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Product detail view lands in Phase 4.
      </p>
    </div>
  )
}
