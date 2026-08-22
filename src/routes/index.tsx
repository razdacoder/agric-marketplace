import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 p-8 pt-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        AgriMarket — buy and sell fresh produce directly from farmers
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        A marketplace connecting farmers and buyers, with personalized
        product recommendations powered by collaborative filtering.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/marketplace">Browse the marketplace</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/auth/register">Get started</Link>
        </Button>
      </div>
    </div>
  )
}
