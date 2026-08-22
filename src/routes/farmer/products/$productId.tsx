import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import { getFarmerProduct, updateProduct } from '#/server/functions/products'
import { ProductForm } from '#/components/products/product-form'
import type { InsertProduct } from '#/lib/validators/products'

export const Route = createFileRoute('/farmer/products/$productId')({
  beforeLoad: requireRole('farmer'),
  loader: ({ params }) =>
    getFarmerProduct({ data: { productId: params.productId } }),
  component: EditProductPage,
})

function EditProductPage() {
  const product = Route.useLoaderData()
  const { productId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (values: InsertProduct) =>
      updateProduct({ data: { productId, data: values } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['farmer-products'] })
      void navigate({ to: '/farmer/products' })
    },
  })

  const defaultValues: InsertProduct = {
    title: product.title,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    category: product.category,
    images: product.images,
    location: product.location,
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit product</h1>
      <ProductForm
        defaultValues={defaultValues}
        submitLabel="Save changes"
        submitting={updateMutation.isPending}
        onSubmit={(values) => updateMutation.mutateAsync(values)}
      />
    </div>
  )
}
