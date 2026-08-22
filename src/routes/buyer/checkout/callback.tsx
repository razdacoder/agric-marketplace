import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'

import { requireRole } from '#/lib/route-guards'
import { verifyPayment } from '#/server/functions/checkout'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/buyer/checkout/callback')({
  beforeLoad: requireRole('buyer'),
  validateSearch: z.object({ reference: z.string().min(1) }),
  component: CheckoutCallbackPage,
})

type Status = 'verifying' | 'paid' | 'failed' | 'error'

function CheckoutCallbackPage() {
  const { reference } = Route.useSearch()
  const [status, setStatus] = useState<Status>('verifying')

  useEffect(() => {
    verifyPayment({ data: { reference } })
      .then((result) => setStatus(result.status))
      .catch(() => setStatus('error'))
  }, [reference])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            {status === 'verifying' && 'Confirming your payment…'}
            {status === 'paid' && 'Payment successful!'}
            {status === 'failed' && 'Payment was not completed'}
            {status === 'error' && 'Something went wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === 'paid' ? (
            <Button asChild>
              <Link to="/buyer/orders">View my orders</Link>
            </Button>
          ) : null}
          {status === 'failed' || status === 'error' ? (
            <Button asChild variant="outline">
              <Link to="/buyer/cart">Back to cart</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
