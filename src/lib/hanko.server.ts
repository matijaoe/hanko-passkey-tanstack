import { tenant } from '@teamhanko/passkeys-sdk'

export const hanko = tenant({
  apiKey: process.env.HANKO_API_KEY!,
  tenantId: process.env.HANKO_TENANT_ID!,
})
