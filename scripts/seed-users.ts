// Seeds one verified, email/password account per role for local testing.
// Idempotent: re-running resets each account's role, verification and password.
//
//   pnpm db:seed-users
//   SEED_PASSWORD=something pnpm db:seed-users
import { randomUUID } from 'node:crypto'

import { hashPassword } from 'better-auth/crypto'
import { and, eq } from 'drizzle-orm'

import { db } from '../src/lib/db/index.ts'
import { account, user } from '../src/lib/db/schema.ts'

const password = process.env.SEED_PASSWORD ?? 'Password123!'

const seedUsers = [
  { name: 'Admin User', email: 'admin@agric.test', role: 'admin' },
  { name: 'Buyer User', email: 'buyer@agric.test', role: 'buyer' },
  { name: 'Seller User', email: 'seller@agric.test', role: 'farmer' },
] as const

const hash = await hashPassword(password)

for (const seed of seedUsers) {
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, seed.email))

  const userId = existing?.id ?? randomUUID()

  if (existing) {
    await db
      .update(user)
      .set({ name: seed.name, role: seed.role, emailVerified: true, banned: false })
      .where(eq(user.id, userId))
  } else {
    await db.insert(user).values({
      id: userId,
      name: seed.name,
      email: seed.email,
      role: seed.role,
      emailVerified: true,
    })
  }

  const [credential] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'credential')))

  if (credential) {
    await db
      .update(account)
      .set({ password: hash })
      .where(eq(account.id, credential.id))
  } else {
    await db.insert(account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: 'credential',
      issuer: 'local:credential',
      userId,
      password: hash,
    })
  }

  console.log(`${existing ? 'updated' : 'created'}  ${seed.role.padEnd(6)}  ${seed.email}`)
}

console.log(`\nPassword for all accounts: ${password}`)
process.exit(0)
