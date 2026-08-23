import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/account-suspended')({
  component: AccountSuspendedPage,
})

function AccountSuspendedPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Account suspended</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your account has been suspended. Contact support if you believe this
        is a mistake.
      </p>
      <Button
        className="mt-6"
        variant="outline"
        onClick={() => {
          void authClient.signOut().then(() => navigate({ to: '/' }))
        }}
      >
        Sign out
      </Button>
    </div>
  )
}
