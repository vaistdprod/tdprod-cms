import type { Payload } from 'payload'

export const createTenant = async (payload: Payload, {
  name,
  slug,
  domain,
}: {
  name: string
  slug: string
  domain: string
}) => {
  try {
    // Create the tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name,
        slug,
        domain,
      },
    })

    // Create a tenant admin user
    await payload.create({
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
    })

    // Create initial homepage
    await payload.create({
      collection: 'pages',
      data: {
        slug: 'home',
        tenant: tenant.id,
        title: `Welcome to ${name}`,
      },
    })

    // Create default office hours
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
    for (const day of weekdays) {
      await payload.create({
        collection: 'office-hours',
        data: {
          dayOfWeek: day,
          openTime: '09:00',
          closeTime: '17:00',
          isClosed: false,
          tenant: tenant.id,
        },
      })
    }

    // Add weekend hours (closed)
    for (const day of ['saturday', 'sunday'] as const) {
      await payload.create({
        collection: 'office-hours',
        data: {
          dayOfWeek: day,
          openTime: '00:00',
          closeTime: '00:00',
          isClosed: true,
          specialNote: 'Closed on weekends',
          tenant: tenant.id,
        },
      })
    }

    return tenant
  } catch (error) {
    console.error('Error creating tenant:', error)
    throw error
  }
}
