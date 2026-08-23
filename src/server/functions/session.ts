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

  if (session.user.banned) {
    throw new Error('Your account has been suspended')
  }

  return session
}

export async function requireServerRole(role: 'farmer' | 'buyer' | 'admin') {
  const session = await requireServerSession()

  if (session.user.role !== role) {
    throw new Error(`Only ${role}s can perform this action`)
  }

  return session
}
