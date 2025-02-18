import type { MigrateUpArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Multiple safety checks to prevent running in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SAFETY CHECK: Cannot run seed migration in production environment')
  }

  if (!process.env.MONGODB_URI?.includes('multi-tenant-dev')) {
    throw new Error('SAFETY CHECK: Can only run seed migration on development database (multi-tenant-dev)')
  }

  // Additional verification prompt
  if (process.env.CONFIRM_SEED !== 'yes') {
    throw new Error(
      'SAFETY CHECK: Must set CONFIRM_SEED=yes in .env.development to run seed migration\n' +
      'This helps prevent accidental database resets.'
    )
  }

  try {
    // Create tenants
    const tenant1Data = {
      name: 'Dr. Sarah\'s Practice',
      slug: 'dr-sarah',
      domain: 'drsarah.test',
    }

    const tenant2Data = {
      name: 'Professional Pediatric Clinic',
      slug: 'pediatric-clinic',
      domain: 'pediatric-clinic.test',
    }

    const tenant1 = await payload.create({
      collection: 'tenants',
      data: tenant1Data,
    })

    // Add delay between tenant creations
    await new Promise(resolve => setTimeout(resolve, 1000))

    const tenant2 = await payload.create({
      collection: 'tenants',
      data: tenant2Data,
    })

    // Add delay before creating users
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create users
    const users = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        roles: ['super-admin'] as ('user' | 'super-admin')[],
      },
      {
        email: 'drsarah@example.com',
        password: 'tenant123',
        tenants: [
          {
            roles: ['tenant-admin'] as ('tenant-admin' | 'tenant-viewer')[],
            tenant: tenant1.id,
          },
        ],
        username: 'drsarah',
      },
      {
        email: 'clinic@example.com',
        password: 'tenant123',
        tenants: [
          {
            roles: ['tenant-admin'] as ('tenant-admin' | 'tenant-viewer')[],
            tenant: tenant2.id,
          },
        ],
        username: 'clinic',
      },
    ]

    for (const userData of users) {
      await payload.create({
        collection: 'users',
        data: userData,
      })
      // Add delay between user creations
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Add delay before creating pages
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create pages
    const pages = [
      {
        slug: 'home',
        tenant: tenant1.id,
        title: 'Welcome to Dr. Sarah\'s Pediatric Practice',
      },
      {
        slug: 'home',
        tenant: tenant2.id,
        title: 'Professional Pediatric Clinic',
      },
    ]

    for (const pageData of pages) {
      await payload.create({
        collection: 'pages',
        data: pageData,
      })
      // Add delay between page creations
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Add delay before creating services
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create services for each tenant
    const servicesForTenant1 = [
      {
        title: 'Well-Child Visits',
        description: 'Regular check-ups to monitor your child\'s growth and development.',
        icon: 'faStethoscope',
        order: 1,
        tenant: tenant1.id,
      },
      {
        title: 'Vaccinations',
        description: 'Complete immunization services following recommended schedules.',
        icon: 'faSyringe',
        order: 2,
        tenant: tenant1.id,
      },
      {
        title: 'Nutritional Counseling',
        description: 'Expert guidance on child nutrition and healthy eating habits.',
        icon: 'faAppleAlt',
        order: 3,
        tenant: tenant1.id,
      },
    ]

    const servicesForTenant2 = [
      {
        title: 'General Pediatrics',
        description: 'Comprehensive healthcare services for children from birth through adolescence.',
        icon: 'faUserMd',
        order: 1,
        tenant: tenant2.id,
      },
      {
        title: 'Preventive Care',
        description: 'Regular check-ups and screenings to maintain optimal health.',
        icon: 'faHeartbeat',
        order: 2,
        tenant: tenant2.id,
      },
      {
        title: 'Developmental Assessment',
        description: 'Monitoring and evaluation of child growth and development milestones.',
        icon: 'faChartLine',
        order: 3,
        tenant: tenant2.id,
      },
    ]

    for (const service of [...servicesForTenant1, ...servicesForTenant2]) {
      await payload.create({
        collection: 'services',
        data: service,
      })
      // Add delay between service creations
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Add delay before creating office hours
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create office hours for each tenant
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
    
    for (const day of daysOfWeek) {
      await payload.create({
        collection: 'office-hours',
        data: {
          dayOfWeek: day,
          openTime: '09:00',
          closeTime: '17:00',
          isClosed: false,
          tenant: tenant1.id,
        },
      })
      await new Promise(resolve => setTimeout(resolve, 500))

      await payload.create({
        collection: 'office-hours',
        data: {
          dayOfWeek: day,
          openTime: '08:30',
          closeTime: '16:30',
          isClosed: false,
          tenant: tenant2.id,
        },
      })
      await new Promise(resolve => setTimeout(resolve, 500))
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
          tenant: tenant1.id,
        },
      })
      await new Promise(resolve => setTimeout(resolve, 500))

      await payload.create({
        collection: 'office-hours',
        data: {
          dayOfWeek: day,
          openTime: '00:00',
          closeTime: '00:00',
          isClosed: true,
          specialNote: 'Closed on weekends',
          tenant: tenant2.id,
        },
      })
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  } catch (error) {
    console.error('Error in seed migration:', error)
    throw error
  }
}
