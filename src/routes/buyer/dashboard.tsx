import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/buyer/dashboard')({
  component: BuyerDashboardPage,
})

function BuyerDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Buyer dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Personalized recommendations land in Phase 7 (collaborative
        filtering).
      </p>
    </div>
  )
}
