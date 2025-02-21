import type { MigrateUpArgs } from '@payloadcms/db-mongodb'

const requiredEnvVars = [
  'SEED_SUPER_ADMIN_EMAIL',
  'SEED_SUPER_ADMIN_PASSWORD',
  'SEED_TENANT1_NAME',
  'SEED_TENANT1_SLUG',
  'SEED_TENANT1_DOMAIN',
  'SEED_TENANT1_ADMIN_EMAIL',
  'SEED_TENANT1_ADMIN_PASSWORD',
  'SEED_TENANT2_NAME',
  'SEED_TENANT2_SLUG',
  'SEED_TENANT2_DOMAIN',
  'SEED_TENANT2_ADMIN_EMAIL',
  'SEED_TENANT2_ADMIN_PASSWORD',
  'SEED_TENANT3_NAME',
  'SEED_TENANT3_SLUG',
  'SEED_TENANT3_DOMAIN',
  'SEED_TENANT3_ADMIN_EMAIL',
  'SEED_TENANT3_ADMIN_PASSWORD',
] as const

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Multiple safety checks to prevent running in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SAFETY CHECK: Cannot run seed migration in production environment')
  }

  if (!process.env.MONGODB_URI?.includes('multi-tenant-dev')) {
    throw new Error('SAFETY CHECK: Can only run seed migration on development database (multi-tenant-dev)')
  }

  // Verify all required environment variables are present
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  if (missingVars.length > 0) {
    throw new Error(
      'Missing required environment variables for seeding:\n' +
      missingVars.join('\n') +
      '\nPlease check your .env.development file'
    )
  }

  try {
    // Check if super admin exists
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
      // Create super admin user if it doesn't exist
      superAdmin = await payload.create({
        collection: 'users',
        data: {
          email: process.env.SEED_SUPER_ADMIN_EMAIL!,
          password: process.env.SEED_SUPER_ADMIN_PASSWORD!,
          roles: ['super-admin'] as ('user' | 'super-admin')[],
        },
      })
    } else {
      superAdmin = existingSuperAdmin.docs[0]
    }

    // Login as super admin to get session
    const { token } = await payload.login({
      collection: 'users',
      data: {
        email: process.env.SEED_SUPER_ADMIN_EMAIL!,
        password: process.env.SEED_SUPER_ADMIN_PASSWORD!,
      },
    })

    // Create tenants with super admin session
    const tenant1Data = {
      name: process.env.SEED_TENANT1_NAME!,
      slug: process.env.SEED_TENANT1_SLUG!,
      domain: process.env.SEED_TENANT1_DOMAIN!,
      allowPublicRead: true,
    }

    const tenant2Data = {
      name: process.env.SEED_TENANT2_NAME!,
      slug: process.env.SEED_TENANT2_SLUG!,
      domain: process.env.SEED_TENANT2_DOMAIN!,
      allowPublicRead: true,
    }

    const tenant3Data = {
      name: process.env.SEED_TENANT3_NAME!,
      slug: process.env.SEED_TENANT3_SLUG!,
      domain: process.env.SEED_TENANT3_DOMAIN!,
      allowPublicRead: true,
    }

    const tenant1 = await payload.create({
      collection: 'tenants',
      data: tenant1Data,
      overrideAccess: true,
    })

    // Add delay between tenant creations
    await new Promise(resolve => setTimeout(resolve, 1000))

    const tenant2 = await payload.create({
      collection: 'tenants',
      data: tenant2Data,
      overrideAccess: true,
    })

    // Add delay between tenant creations
    await new Promise(resolve => setTimeout(resolve, 1000))

    const tenant3 = await payload.create({
      collection: 'tenants',
      data: tenant3Data,
      overrideAccess: true,
    })

    // Add delay before creating users
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create tenant admin users if they don't exist
    const tenantUsers = [
      {
        email: process.env.SEED_TENANT1_ADMIN_EMAIL!,
        password: process.env.SEED_TENANT1_ADMIN_PASSWORD!,
        tenants: [
          {
            roles: ['tenant-admin'] as ('tenant-admin' | 'tenant-viewer')[],
            tenant: tenant1.id,
          },
        ],
        username: process.env.SEED_TENANT1_SLUG!,
      },
      {
        email: process.env.SEED_TENANT2_ADMIN_EMAIL!,
        password: process.env.SEED_TENANT2_ADMIN_PASSWORD!,
        tenants: [
          {
            roles: ['tenant-admin'] as ('tenant-admin' | 'tenant-viewer')[],
            tenant: tenant2.id,
          },
        ],
        username: process.env.SEED_TENANT2_SLUG!,
      },
      {
        email: process.env.SEED_TENANT3_ADMIN_EMAIL!,
        password: process.env.SEED_TENANT3_ADMIN_PASSWORD!,
        tenants: [
          {
            roles: ['tenant-admin'] as ('tenant-admin' | 'tenant-viewer')[],
            tenant: tenant3.id,
          },
        ],
        username: process.env.SEED_TENANT3_SLUG!,
      },
    ]

    for (const userData of tenantUsers) {
      const existingUser = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: userData.email
          }
        }
      })

      if (existingUser.docs.length === 0) {
        await payload.create({
          collection: 'users',
          data: userData,
          overrideAccess: true,
        })
        // Add delay between user creations
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Add delay before creating pages
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create pages
    const pages = [
      {
        slug: `home-${tenant1.id}`,
        uniqueSlug: `home-${tenant1.id}`,
        associatedTenant: tenant1.id,
        title: `Welcome to ${tenant1Data.name}`,
        layout: [
          {
            blockType: 'hero' as const,
            heading: `Welcome to ${tenant1Data.name}`,
            subheading: 'Providing compassionate pediatric care with a gentle touch',
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
                        text: 'Welcome to our pediatric practice where your child\'s health and well-being are our top priorities.'
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
      {
        slug: `home-${tenant2.id}`,
        uniqueSlug: `home-${tenant2.id}`,
        associatedTenant: tenant2.id,
        title: `Welcome to ${tenant2Data.name}`,
        layout: [
          {
            blockType: 'hero' as const,
            heading: `Welcome to ${tenant2Data.name}`,
            subheading: 'Expert pediatric care for your growing family',
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
                        text: 'We are dedicated to providing comprehensive healthcare services for children from birth through adolescence.'
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
      {
        slug: `home-${tenant3.id}`,
        uniqueSlug: `home-${tenant3.id}`,
        associatedTenant: tenant3.id,
        title: `Welcome to ${tenant3Data.name}`,
        layout: [
          {
            blockType: 'hero' as const,
            heading: `Welcome to ${tenant3Data.name}`,
            subheading: 'Modern pediatric care with a personal touch',
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
                        text: 'At PediCare, we combine modern medical expertise with compassionate care to ensure your child\'s optimal health and development.'
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
    ]

    for (const pageData of pages) {
      await payload.create({
        collection: 'pages',
        data: pageData,
        overrideAccess: true,
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

    const servicesForTenant3 = [
      {
        title: 'Primary Care',
        description: 'Comprehensive pediatric care including well-child visits, vaccinations, and sick visits.',
        icon: 'faHospital',
        order: 1,
        tenant: tenant3.id,
      },
      {
        title: 'Child Development',
        description: 'Expert monitoring and guidance for your child\'s physical and developmental milestones.',
        icon: 'faChild',
        order: 2,
        tenant: tenant3.id,
      },
      {
        title: 'Preventive Health',
        description: 'Regular check-ups and screenings to ensure your child\'s optimal health and development.',
        icon: 'faShieldVirus',
        order: 3,
        tenant: tenant3.id,
      },
      {
        title: 'Behavioral Health',
        description: 'Support and guidance for behavioral and emotional development.',
        icon: 'faBrain',
        order: 4,
        tenant: tenant3.id,
      },
      {
        title: 'Family Education',
        description: 'Resources and guidance to help parents make informed decisions about their child\'s health.',
        icon: 'faGraduationCap',
        order: 5,
        tenant: tenant3.id,
      }
    ]

    for (const service of [...servicesForTenant1, ...servicesForTenant2, ...servicesForTenant3]) {
      await payload.create({
        collection: 'services',
        data: service,
        overrideAccess: true,
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
          associatedTenant: tenant1.id,
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
          associatedTenant: tenant2.id,
        },
      })
      await new Promise(resolve => setTimeout(resolve, 500))

      await payload.create({
        collection: 'office-hours',
        data: {
          dayOfWeek: day,
          openTime: '08:00',
          closeTime: '17:00',
          isClosed: false,
          associatedTenant: tenant3.id,
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
          associatedTenant: tenant1.id,
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
          associatedTenant: tenant2.id,
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
          associatedTenant: tenant3.id,
        },
      })
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  } catch (error) {
    console.error('Error in seed migration:', error)
    throw error
  }
}
