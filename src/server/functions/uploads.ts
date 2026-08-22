import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { cloudinary } from '#/lib/cloudinary'
import { requireServerSession } from '#/server/functions/session'

export const uploadProductImage = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      dataUrl: z.string().regex(/^data:image\/(png|jpe?g|webp|gif);base64,/),
    }),
  )
  .handler(async ({ data }) => {
    await requireServerSession()

    const result = await cloudinary.uploader.upload(data.dataUrl, {
      folder: 'agric-marketplace/products',
    })

    return { url: result.secure_url }
  })
