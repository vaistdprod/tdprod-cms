import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    // Check if tenant exists first
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        slug: {
          equals: 'initial-tenant'
        }
      }
    })

    let tenant
    if (existingTenant.docs.length === 0) {
      // Create initial tenant
      tenant = await payload.create({
        collection: 'tenants',
        data: {
          name: 'Initial Tenant',
          slug: 'initial-tenant',
          domain: 'initial-tenant.local',
          allowPublicRead: true,
        },
        overrideAccess: true,
      })
    } else {
      tenant = existingTenant.docs[0]
    }

    // Create super admin user if it doesn't exist
    const existingSuperAdmin = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: process.env.SEED_SUPER_ADMIN_EMAIL!
        }
      }
    })

    let superAdmin
    if (existingSuperAdmin.docs.length === 0) {
      superAdmin = await payload.create({
        collection: 'users',
        data: {
          email: process.env.SEED_SUPER_ADMIN_EMAIL!,
          password: process.env.SEED_SUPER_ADMIN_PASSWORD!,
          roles: ['super-admin'],
          username: 'super_admin',
          tenants: [
            {
              roles: ['tenant-admin'],
              tenant: tenant.id,
            },
          ],
        },
        overrideAccess: true,
      })
    } else {
      superAdmin = existingSuperAdmin.docs[0]
    }

    // Create tenant admin user if it doesn't exist
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@initial-tenant.local'
        }
      }
    })

    if (existingUser.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@initial-tenant.local',
          password: 'changeme123', // Should be changed on first login
          tenants: [
            {
              roles: ['tenant-admin'],
              tenant: tenant.id,
            },
          ],
          username: 'admin_initial-tenant',
        },
        overrideAccess: true,
      })
    }

    // Create initial homepage if it doesn't exist
    const existingPage = await payload.find({
      collection: 'pages',
      where: {
        AND: [
          {
            slug: {
              equals: 'home'
            }
          },
          {
            associatedTenant: {
              equals: tenant.id
            }
          }
        ]
      }
    })

    if (existingPage.docs.length === 0) {
      await payload.create({
        collection: 'pages',
        data: {
          slug: `home-${tenant.id}`,
          uniqueSlug: `home-${tenant.id}`,
          associatedTenant: tenant.id,
          title: 'Welcome to Initial Tenant',
          layout: [
            {
              blockType: 'hero' as const,
              heading: 'Welcome to Initial Tenant',
              subheading: 'Your trusted healthcare partner',
              style: {
                textAlignment: 'center' as const,
                height: '75vh' as const,
                padding: {
                  top: '4rem',
                  bottom: '4rem'
                }
              }
            },
            {
              blockType: 'textContent' as const,
              content: {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'paragraph',
                      version: 1,
                      children: [
                        {
                          type: 'text',
                          version: 1,
                          text: 'Welcome to our practice. We are dedicated to providing the highest quality healthcare services.'
                        }
                      ]
                    }
                  ],
                  direction: null,
                  format: 'left' as const,
                  indent: 0,
                  version: 1
                }
              },
              style: {
                alignment: 'center' as const,
                padding: {
                  top: '2rem',
                  bottom: '2rem'
                }
              }
            }
          ]
        },
        overrideAccess: true,
      })
    }

    console.log('Successfully created initial tenant')
  } catch (error) {
    console.error('Error creating tenant:', error)
    throw error
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  try {
    // Find and delete the initial tenant
    const tenant = await payload.find({
      collection: 'tenants',
      where: {
        slug: {
          equals: 'initial-tenant'
        }
      }
    })

    if (tenant.docs.length > 0) {
      const tenantId = tenant.docs[0].id

      // Delete pages
      await payload.delete({
        collection: 'pages',
        where: {
          associatedTenant: {
            equals: tenantId
          }
        }
      })

      // Delete users
      await payload.delete({
        collection: 'users',
        where: {
          username: {
            equals: 'admin_initial-tenant'
          }
        }
      })

      // Finally, delete the tenant
      await payload.delete({
        collection: 'tenants',
        id: tenantId
      })
    }

    console.log('Successfully removed initial tenant')
  } catch (error) {
    console.error('Error removing tenant:', error)
    throw error
  }
}
