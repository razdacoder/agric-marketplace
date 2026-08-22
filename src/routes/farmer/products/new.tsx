import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import { createProduct } from '#/server/functions/products'
import { ProductForm } from '#/components/products/product-form'
import type { InsertProduct } from '#/lib/validators/products'

export const Route = createFileRoute('/farmer/products/new')({
  beforeLoad: requireRole('farmer'),
  component: NewProductPage,
})

function NewProductPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (values: InsertProduct) => createProduct({ data: values }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['farmer-products'] })
      void navigate({ to: '/farmer/products' })
    },
  })

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">New product</h1>
      <ProductForm
        submitLabel="Create listing"
        submitting={createMutation.isPending}
        onSubmit={(values) => createMutation.mutateAsync(values)}
      />
    </div>
  )
}
