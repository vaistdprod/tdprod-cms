import { createSupabaseAdapter } from './db/supabase/adapter'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload/config'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { initializeServer, cleanupServer } from './server'

import { Pages } from './collections/Pages'
import { Tenants } from './collections/Tenants'
import Users from './collections/Users'
import { Services } from './collections/Services'
import { OfficeHours } from './collections/OfficeHours'
import { Posts } from './collections/Posts'
import { Media } from './collections/Media'
import { Team } from './collections/Team'
import { Testimonials } from './collections/Testimonials'
import { FAQs } from './collections/FAQs'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { isSuperAdmin } from './access/isSuperAdmin'
import type { Config } from './payload-types'
import { getUserTenantIDs } from './utilities/getUserTenantIDs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// eslint-disable-next-line no-restricted-exports
const config = buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    Pages,
    Users,
    Tenants,
    Services,
    OfficeHours,
    Posts,
    Media,
    Team,
    Testimonials,
    FAQs,
  ],
  db: createSupabaseAdapter(),
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  secret: process.env.PAYLOAD_SECRET as string,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
  sharp,
  plugins: process.env.PAYLOAD_DISABLE_PLUGINS ? [] : [
    multiTenantPlugin<Config>({
      collections: {
        pages: {
          useBaseListFilter: true,
          useTenantAccess: true,
        },
        services: {
          useBaseListFilter: true,
          useTenantAccess: true,
        },
        'office-hours': {
          useBaseListFilter: true,
          useTenantAccess: true,
        },
        posts: {
          useBaseListFilter: true,
          useTenantAccess: true,
        },
        media: {
          useBaseListFilter: true,
          useTenantAccess: true,
        },
        testimonials: {
          useBaseListFilter: true,
          useTenantAccess: true,
        },
        faqs: {
          useBaseListFilter: true,
          useTenantAccess: true,
        },
      },
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }: { req: any }) => {
            if (isSuperAdmin(req.user)) {
              return true
            }
            return getUserTenantIDs(req.user).length > 0
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user: any) => isSuperAdmin(user),
    }),
  ],
})

// Initialize server when Payload starts
if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview') {
  initializeServer().catch(console.error)
}

// Handle cleanup on process termination
process.on('beforeExit', async () => {
  await cleanupServer()
})

export default config
