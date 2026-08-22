import { Link, useNavigate } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'

const dashboardPathByRole: Record<string, string> = {
  farmer: '/farmer/dashboard',
  buyer: '/buyer/dashboard',
  admin: '/admin/dashboard',
}

export default function UserMenu() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    )
  }

  if (session?.user) {
    const dashboardPath = dashboardPathByRole[session.user.role] ?? '/'

    return (
      <div className="flex items-center gap-3">
        <Link to={dashboardPath} className="text-sm font-medium">
          Dashboard
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void authClient.signOut().then(() => navigate({ to: '/' }))
          }}
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link to="/auth/login" className="text-sm font-medium">
        Log in
      </Link>
      <Button asChild size="sm">
        <Link to="/auth/register">Sign up</Link>
      </Button>
    </div>
  )
}
