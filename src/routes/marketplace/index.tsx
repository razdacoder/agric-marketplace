import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/marketplace/')({
  component: MarketplacePage,
})

function MarketplacePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Marketplace</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Product browsing, search, and filters land in Phase 4.
      </p>
    </div>
  )
}
