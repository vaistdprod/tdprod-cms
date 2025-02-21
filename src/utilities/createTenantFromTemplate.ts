import { Payload } from 'payload'
import { getBusinessTemplate } from '../templates/tenantTemplates'
import { Config, Tenant } from '../payload-types'

type CollectionKey = keyof Config['collections']

type CreateTenantOptions = {
  name: string
  slug: string
  domain: string
  businessType: Tenant['businessType']
}

export const createTenantFromTemplate = async (
  payload: Payload,
  options: CreateTenantOptions
) => {
  const { name, slug, domain, businessType } = options
  const template = getBusinessTemplate(businessType)
  const timestamp = Date.now()

  try {
    // Create the tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name,
        slug,
        domain,
        businessType,
        features: template.features,
        theme: {
          primaryColor: template.theme.primaryColor || null,
          secondaryColor: template.theme.secondaryColor || null,
          fontFamily: template.theme.fontFamily,
        },
        allowPublicRead: true,
        contact: {
          email: `contact@${domain}`,
        },
      },
      overrideAccess: true,
    })

    // Create tenant admin user with unique email
    const adminUser = await payload.create({
      collection: 'users',
      data: {
        email: `admin+${timestamp}@${domain}`,
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

    // Create default pages
    const pages = await Promise.all(
      template.defaultPages.map(async (page) => {
        const uniqueSlug = `${page.slug}-${tenant.id}`
        return payload.create({
          collection: 'pages',
          data: {
            ...page,
            slug: uniqueSlug,
            uniqueSlug,
            associatedTenant: tenant.id,
            title: page.title.replace(/\[.*?\]/g, name), // Replace placeholders with tenant name
            layout: page.layout.map(block => ({
              ...block,
              heading: block.heading?.replace(/\[.*?\]/g, name) || block.heading,
              content: block.content ? {
                ...block.content,
                root: {
                  ...block.content.root,
                  children: block.content.root.children.map((child: any) => ({
                    ...child,
                    children: child.children.map((textNode: any) => ({
                      ...textNode,
                      text: textNode.text?.replace(/\[.*?\]/g, name) || textNode.text
                    }))
                  }))
                }
              } : block.content
            }))
          },
          overrideAccess: true,
        })
      })
    )

    // Create default collection items if they exist in the template
    const collections = await Promise.all(
      Object.entries(template.defaultCollections).map(async ([collection, items]) => {
        if (!items?.length) return null

        return Promise.all(
          items.map(async (item) => {
            return payload.create({
              collection: collection as CollectionKey,
              data: {
                ...item,
                associatedTenant: tenant.id,
                // Replace any placeholders in strings with the tenant name
                ...(Object.entries(item).reduce((acc, [key, value]) => {
                  if (typeof value === 'string') {
                    acc[key] = value.replace(/\[.*?\]/g, name)
                  }
                  return acc
                }, {} as Record<string, any>))
              },
              overrideAccess: true,
            })
          })
        )
      })
    )

    return {
      tenant,
      adminUser,
      pages,
      collections,
    }
  } catch (error) {
    console.error('Error creating tenant from template:', error)
    throw error
  }
}
