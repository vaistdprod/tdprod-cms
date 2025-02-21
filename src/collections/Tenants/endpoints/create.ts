import { PayloadHandler } from 'payload'
import { APIError } from 'payload'
import { createTenant } from '../../../migrations/create-tenant'
import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { headersWithCors } from '@payloadcms/next/utilities'

type CreateTenantBody = {
  name: string
  slug: string
  domain: string
}

export const createNewTenant = {
  method: 'post',
  path: '/create-new',
  handler: (async (req) => {
    if (!isSuperAdmin(req.user)) {
      throw new APIError('Unauthorized. Only super admins can create new tenants.', 403)
    }

    let data: unknown

    try {
      if (typeof req.json === 'function') {
        data = await req.json()
      } else {
        data = req.body
      }
    } catch (error) {
      throw new APIError('Invalid request body', 400)
    }

    if (!data || typeof data !== 'object') {
      throw new APIError('Invalid request body format', 400)
    }

    const body = data as Record<string, unknown>
    if (
      typeof body.name !== 'string' ||
      typeof body.slug !== 'string' ||
      typeof body.domain !== 'string'
    ) {
      throw new APIError('Invalid request body format: name, slug, and domain must be strings', 400)
    }

    const { name, slug, domain } = body

    if (!name || !slug || !domain) {
      throw new APIError('Missing required fields: name, slug, and domain are required.', 400)
    }

    try {
      const tenant = await createTenant(req.payload, {
        name,
        slug,
        domain,
      })

      return Response.json(
        {
          message: 'Tenant created successfully',
          tenant,
        },
        {
          headers: headersWithCors({
            headers: new Headers(),
            req,
          }),
          status: 200,
        }
      )
    } catch (error: any) {
      throw new APIError(`Error creating tenant: ${error.message}`, 500)
    }
  }) as PayloadHandler,
}
