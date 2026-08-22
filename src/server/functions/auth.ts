import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    })

    if (!session) {
      return null
    }

    const { id, name, email, role, image } = session.user

    return { id, name, email, role, image }
  },
)
