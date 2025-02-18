import { Access, PayloadRequest } from 'payload'

interface TenantRole {
  tenant: string
  roles: string[]
}

interface User {
  roles?: string[]
  tenants?: TenantRole[]
}

export const superAdminOrTenantAdminAccess: Access = ({ req }: { req: PayloadRequest }) => {
  const user = req.user as User | null

  // Allow super admins full access
  if (user?.roles?.includes('super-admin')) return true

  // For tenant admins, only allow access to their tenant's pages
  if (user?.tenants?.some((t: TenantRole) => t.roles.includes('tenant-admin'))) {
    return {
      tenant: {
        in: user.tenants.map((t: TenantRole) => t.tenant),
      },
    }
  }

  // Deny access to all others
  return false
}
