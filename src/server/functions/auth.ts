import { createServerFn } from '@tanstack/react-start'

import { getServerSession } from '#/server/functions/session'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getServerSession()

    if (!session) {
      return null
    }

    const { id, name, email, role, image, banned } = session.user

    return { id, name, email, role, image, banned }
  },
)
