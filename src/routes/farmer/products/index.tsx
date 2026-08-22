import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/farmer/products/')({
  component: FarmerProductsPage,
})

function FarmerProductsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">My products</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Product CRUD (create/edit/delete listings) lands in Phase 3.
      </p>
    </div>
  )
}
