import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import {
  marketplaceProductsQueryOptions,
  marketplaceStatsQueryOptions,
} from '#/lib/queries/marketplace'
import { productCategories } from '#/lib/validators/products'
import { MarketplaceProductCard } from '#/components/products/marketplace-product-card'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <StatsStrip />
      <CategoryGrid />
      <FeaturedListings />
      <HowItWorks />
      <FinalCta />
    </div>
  )
}

function Hero() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    void navigate({
      to: '/marketplace',
      search: { q: q.trim() || undefined, page: 1, pageSize: 12 },
    })
  }

  return (
    <section className="border-b px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Buy fresh produce, straight from the farmers who grow it.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          AgriMarket connects farmers and buyers directly: browse verified
          listings, get recommendations tailored to you, and pay securely at
          checkout.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-2 flex w-full max-w-lg gap-2"
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for tomatoes, rice, mangoes…"
            className="h-12 text-base"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/marketplace">Browse the marketplace</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth/register">Sell your produce</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function StatsStrip() {
  const { data } = useQuery(marketplaceStatsQueryOptions())

  const stats = [
    { label: 'Listings live', value: data?.productCount },
    { label: 'Farmers selling', value: data?.farmerCount },
    { label: 'Categories covered', value: data?.categoryCount },
  ]

  return (
    <section className="border-b px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold">{stat.value ?? '—'}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CategoryGrid() {
  return (
    <section className="px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-2xl font-semibold">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {productCategories.map((category) => (
            <Link
              key={category}
              to="/marketplace"
              search={{ category, page: 1, pageSize: 12 }}
              className="rounded-lg border p-4 text-center font-medium capitalize transition-colors hover:border-primary hover:bg-accent"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedListings() {
  const { data } = useQuery(
    marketplaceProductsQueryOptions({ page: 1, pageSize: 8 }),
  )

  if (data && data.items.length === 0) return null

  return (
    <section className="border-t px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured listings</h2>
          <Button asChild variant="outline">
            <Link to="/marketplace">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data?.items.map((product) => (
            <MarketplaceProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="border-t bg-secondary/40 px-4 py-16 sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <h3 className="text-lg font-semibold">For buyers</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>Browse listings and get picks recommended for you</li>
              <li>Add to cart and check out securely with Paystack</li>
              <li>Rate and review after your order arrives</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <h3 className="text-lg font-semibold">For farmers</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>List your produce for admin approval</li>
              <li>Reach buyers directly, no middlemen</li>
              <li>Track orders and grow your sales</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="px-4 py-20 text-center sm:px-8">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/marketplace">Browse the marketplace</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth/register">Sell your produce</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
