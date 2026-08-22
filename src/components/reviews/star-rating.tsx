import { cn } from '#/lib/utils.ts'

export function StarRatingDisplay({
  average,
  count,
  className,
}: {
  average: number
  count: number
  className?: string
}) {
  if (count === 0) {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>
        No reviews yet
      </p>
    )
  }

  return (
    <div className={cn('flex items-center gap-1 text-sm', className)}>
      <Stars value={average} />
      <span className="text-muted-foreground">
        {average.toFixed(1)} ({count})
      </span>
    </div>
  )
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          className={cn(
            'text-2xl leading-none',
            star <= value ? 'text-yellow-500' : 'text-muted-foreground/30',
          )}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <span className="text-yellow-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= rounded ? '★' : '☆'}</span>
      ))}
    </span>
  )
}
