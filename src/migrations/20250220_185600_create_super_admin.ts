import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    // Check if super admin exists first
    const existingSuperAdmin = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: process.env.SEED_SUPER_ADMIN_EMAIL!
        }
      }
    })

    if (existingSuperAdmin.docs.length === 0) {
      // Create super admin user
      await payload.create({
        collection: 'users',
        data: {
          email: process.env.SEED_SUPER_ADMIN_EMAIL!,
          password: process.env.SEED_SUPER_ADMIN_PASSWORD!,
          roles: ['super-admin'],
          username: 'super_admin',
        },
        overrideAccess: true,
      })

      console.log('Successfully created super admin user')
    } else {
      console.log('Super admin user already exists')
    }
  } catch (error) {
    console.error('Error creating super admin:', error)
    throw error
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  try {
    // Find and delete the super admin user
    const superAdmin = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: process.env.SEED_SUPER_ADMIN_EMAIL!
        }
      }
    })

    if (superAdmin.docs.length > 0) {
      await payload.delete({
        collection: 'users',
        id: superAdmin.docs[0].id
      })
      console.log('Successfully removed super admin user')
    }
  } catch (error) {
    console.error('Error removing super admin:', error)
    throw error
  }
}
