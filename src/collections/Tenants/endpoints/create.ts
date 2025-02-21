import { PayloadHandler } from 'payload'
import { APIError } from 'payload'
import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { headersWithCors } from '@payloadcms/next/utilities'
import { Tenant } from '../../../payload-types'

type CreateTenantBody = {
  name: string
  slug: string
  domain: string
  businessType: Tenant['businessType']
  features?: {
    blog?: boolean
    team?: boolean
    services?: boolean
    testimonials?: boolean
    appointments?: boolean
  }
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: 'inter' | 'montserrat' | 'roboto' | 'open-sans'
  }
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
      typeof body.domain !== 'string' ||
      typeof body.businessType !== 'string' ||
      !['healthcare', 'legal', 'non-profit', 'professional', 'education', 'other'].includes(body.businessType)
    ) {
      throw new APIError('Invalid request body format: name, slug, domain, and valid businessType are required', 400)
    }

    const { name, slug, domain, businessType, features, theme } = body as CreateTenantBody

    if (!name || !slug || !domain) {
      throw new APIError('Missing required fields: name, slug, and domain are required.', 400)
    }

    try {
      // Create the tenant
      const tenant = await req.payload.create({
        collection: 'tenants',
        data: {
          name,
          slug,
          domain,
          businessType,
          features: features || {
            blog: false,
            team: true,
            services: true,
            testimonials: true,
            appointments: false,
          },
          theme: theme || {
            primaryColor: '#007bff',
            secondaryColor: '#6c757d',
            fontFamily: 'inter',
          },
          contact: {
            email: `contact@${domain}`,
          },
          allowPublicRead: true,
        },
        overrideAccess: true,
      })

      // Create tenant admin user
      const adminUser = await req.payload.create({
        collection: 'users',
        data: {
          email: `admin@${domain}`,
          password: 'changeme123', // Should be changed on first login
          tenants: [
            {
              roles: ['tenant-admin'],
              tenant: tenant.id,
            },
          ],
          username: `admin_${slug}`,
        },
        overrideAccess: true,
      })

      // Create initial homepage
      const homepage = await req.payload.create({
        collection: 'pages',
        data: {
          title: 'Home',
          slug: 'home',
          uniqueSlug: `home-${tenant.id}`,
          associatedTenant: tenant.id,
          navigation: {
            showInMainNav: true,
            navOrder: 1,
          },
          layout: [
            {
              blockType: 'hero',
              heading: 'Welcome',
              subheading: 'Your journey starts here',
              style: {
                textAlignment: 'center',
                height: '75vh',
                padding: {
                  top: '4rem',
                  bottom: '4rem',
                },
              },
            },
          ],
          meta: {
            title: name,
            description: `Welcome to ${name}`,
          },
        },
        overrideAccess: true,
      })

      return Response.json(
        {
          message: 'Tenant created successfully',
          tenant,
          adminUser,
          homepage,
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
