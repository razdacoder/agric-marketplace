import { useState } from 'react'

import {
  insertProductSchema,
  productCategories
  
} from '#/lib/validators/products'
import type {InsertProduct} from '#/lib/validators/products';
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { ProductImageUploader } from '#/components/products/product-image-uploader'

interface ProductFormProps {
  defaultValues?: InsertProduct
  submitLabel: string
  submitting: boolean
  onSubmit: (values: InsertProduct) => unknown
}

const emptyValues: InsertProduct = {
  title: '',
  description: '',
  price: '',
  quantity: 0,
  category: 'other',
  images: [],
  location: '',
}

export function ProductForm({
  defaultValues,
  submitLabel,
  submitting,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<InsertProduct>(
    defaultValues ?? emptyValues,
  )
  const [error, setError] = useState<string | null>(null)

  function update<TKey extends keyof InsertProduct>(
    key: TKey,
    value: InsertProduct[TKey],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const result = insertProductSchema.safeParse(values)
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    await onSubmit(result.data)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Price (₦)</Label>
          <Input
            id="price"
            inputMode="decimal"
            value={values.price}
            onChange={(e) => update('price', e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min={0}
            value={values.quantity}
            onChange={(e) => update('quantity', Number(e.target.value))}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={values.category}
            onValueChange={(value) =>
              update('category', value as InsertProduct['category'])
            }
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category[0].toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={values.location}
            onChange={(e) => update('location', e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Images</Label>
        <ProductImageUploader
          images={values.images}
          onChange={(images) => update('images', images)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
