import { useState } from 'react'
import { X } from 'lucide-react'

import { uploadProductImage } from '#/server/functions/uploads'

const MAX_IMAGES = 8
const MAX_FILE_SIZE = 5 * 1024 * 1024

interface ProductImageUploaderProps {
  images: Array<string>
  onChange: (images: Array<string>) => void
}

export function ProductImageUploader({
  images,
  onChange,
}: ProductImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)

    const remainingSlots = MAX_IMAGES - images.length
    const selected = Array.from(files).slice(0, remainingSlots)
    const uploaded: Array<string> = []

    setUploading(true)
    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('Images must be under 5MB')
        continue
      }

      try {
        const dataUrl = await readFileAsDataUrl(file)
        const { url } = await uploadProductImage({ data: { dataUrl } })
        uploaded.push(url)
      } catch {
        setError('Upload failed. Check the Cloudinary configuration.')
      }
    }
    setUploading(false)

    if (uploaded.length > 0) {
      onChange([...images, ...uploaded])
    }
  }

  function removeImage(url: string) {
    onChange(images.filter((image) => image !== url))
  }

  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20">
              <img
                src={url}
                alt=""
                className="h-20 w-20 rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {images.length < MAX_IMAGES ? (
        <div className="flex flex-col gap-1">
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => void handleFiles(e.target.files)}
            className="text-sm"
          />
          {uploading ? (
            <p className="text-xs text-muted-foreground">Uploading…</p>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}
