import { getRequest } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'

export async function getServerSession() {
  return auth.api.getSession({ headers: getRequest().headers })
}

export async function requireServerSession() {
  const session = await getServerSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  return session
}
