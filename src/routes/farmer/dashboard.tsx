import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/farmer/dashboard')({
  component: FarmerDashboardPage,
})

function FarmerDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Farmer dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sales overview and listing management land in Phase 3.
      </p>
    </div>
  )
}
