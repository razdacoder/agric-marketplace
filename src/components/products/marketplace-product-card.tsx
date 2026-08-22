import { Link } from '@tanstack/react-router'

import { StarRatingDisplay } from '#/components/reviews/star-rating'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent } from '#/components/ui/card'

interface MarketplaceProductCardProps {
  product: {
    id: string
    title: string
    price: string
    category: string
    location: string
    images: Array<string>
    rating: { average: number; count: number }
  }
}

export function MarketplaceProductCard({
  product,
}: MarketplaceProductCardProps) {
  return (
    <Link
      to="/marketplace/$productId"
      params={{ productId: product.id }}
      className="block"
    >
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-square w-full bg-muted">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="flex flex-col gap-1 pt-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium">{product.title}</h3>
            <Badge variant="outline" className="shrink-0">
              {product.category}
            </Badge>
          </div>
          <p className="text-sm font-semibold">₦{product.price}</p>
          <p className="text-xs text-muted-foreground">{product.location}</p>
          <StarRatingDisplay
            average={product.rating.average}
            count={product.rating.count}
          />
        </CardContent>
      </Card>
    </Link>
  )
}
