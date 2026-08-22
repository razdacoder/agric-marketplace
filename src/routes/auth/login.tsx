import { createFileRoute } from '@tanstack/react-router'

import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/auth/login')({ component: LoginPage })

function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Login form coming in Phase 2 (authentication flows).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
