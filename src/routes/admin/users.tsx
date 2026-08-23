import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { requireRole } from '#/lib/route-guards'
import { adminUsersQueryOptions } from '#/lib/queries/admin'
import { setUserBanned, updateUserRole } from '#/server/functions/admin'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export const Route = createFileRoute('/admin/users')({
  beforeLoad: requireRole('admin'),
  component: AdminUsersPage,
})

const ALL_ROLES = '__all__'
type Role = 'farmer' | 'buyer' | 'admin'

function AdminUsersPage() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState(ALL_ROLES)
  const queryClient = useQueryClient()

  const filters = {
    q: q.trim() || undefined,
    role: role === ALL_ROLES ? undefined : (role as Role),
  }
  const { data: users, isLoading } = useQuery(adminUsersQueryOptions(filters))

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })

  const roleMutation = useMutation({
    mutationFn: (input: { userId: string; role: Role }) =>
      updateUserRole({ data: input }),
    onSuccess: invalidate,
  })

  const banMutation = useMutation({
    mutationFn: (input: { userId: string; banned: boolean }) =>
      setUserBanned({ data: input }),
    onSuccess: invalidate,
  })

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Manage users</h1>

      <div className="mb-6 flex gap-3">
        <Input
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>All roles</SelectItem>
            <SelectItem value="farmer">Farmer</SelectItem>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {users?.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex items-center justify-between gap-4 pt-6">
              <div>
                <p className="font-medium">
                  {u.name}{' '}
                  {u.banned ? (
                    <Badge variant="destructive" className="ml-2">
                      Suspended
                    </Badge>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={u.role}
                  onValueChange={(value) =>
                    roleMutation.mutate({ userId: u.id, role: value as Role })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={banMutation.isPending}
                  onClick={() =>
                    banMutation.mutate({ userId: u.id, banned: !u.banned })
                  }
                >
                  {u.banned ? 'Unsuspend' : 'Suspend'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
