import { z } from 'zod'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const usernameSchema = z
  .string()
  .min(2)
  .max(32)
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type User = typeof users.$inferSelect
