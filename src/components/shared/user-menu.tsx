import { Link, useNavigate } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'

const dashboardPathByRole: Record<string, string> = {
  farmer: '/farmer/dashboard',
  buyer: '/buyer/dashboard',
  admin: '/admin/dashboard',
}

interface UserMenuProps {
  user: { role: string } | null
}

export default function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate()

  if (user) {
    const dashboardPath = dashboardPathByRole[user.role] ?? '/'

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
