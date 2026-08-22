import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { marketplaceFiltersSchema } from '#/lib/validators/marketplace'
import type { MarketplaceFilters } from '#/lib/validators/marketplace'
import { productCategories } from '#/lib/validators/products'
import { marketplaceProductsQueryOptions } from '#/lib/queries/marketplace'
import { MarketplaceProductCard } from '#/components/products/marketplace-product-card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export const Route = createFileRoute('/marketplace/')({
  validateSearch: marketplaceFiltersSchema,
  component: MarketplacePage,
})

const ALL_CATEGORIES = '__all__'

function MarketplacePage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [q, setQ] = useState(search.q ?? '')
  const [category, setCategory] = useState(search.category ?? ALL_CATEGORIES)
  const [minPrice, setMinPrice] = useState(search.minPrice?.toString() ?? '')
  const [maxPrice, setMaxPrice] = useState(search.maxPrice?.toString() ?? '')
  const [location, setLocation] = useState(search.location ?? '')

  const { data, isLoading } = useQuery(marketplaceProductsQueryOptions(search))

  function applyFilters(event: React.FormEvent) {
    event.preventDefault()
    void navigate({
      search: {
        q: q.trim() || undefined,
        category:
          category === ALL_CATEGORIES
            ? undefined
            : (category as MarketplaceFilters['category']),
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        location: location.trim() || undefined,
        page: 1,
        pageSize: search.pageSize,
      },
    })
  }

  function goToPage(page: number) {
    void navigate({ search: { ...search, page } })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Marketplace</h1>

      <form
        onSubmit={applyFilters}
        className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Input
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="lg:col-span-2"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
            {productCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Min price"
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <Input
          placeholder="Max price"
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Button type="submit">Apply filters</Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : null}

      {!isLoading && data?.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No products match your filters.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.items.map((product) => (
          <MarketplaceProductCard key={product.id} product={product} />
        ))}
      </div>

      {data && data.total > data.pageSize ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={search.page <= 1}
            onClick={() => goToPage(search.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {search.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={search.page >= totalPages}
            onClick={() => goToPage(search.page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}
