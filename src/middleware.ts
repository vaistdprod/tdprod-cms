import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPayload } from './utilities/getPayload'

// Cache tenant data in memory to avoid frequent DB lookups
// This will be refreshed periodically and on tenant updates
let tenantCache: Record<string, { slug: string; id: string }> = {}
let lastCacheUpdate = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function refreshTenantCache() {
  try {
    const payload = await getPayload()
    const tenants = await payload.find({
      collection: 'tenants',
      where: {
        domain: { exists: true },
      },
    })

    const newCache: typeof tenantCache = {}
    tenants.docs.forEach((tenant: { domain?: string; slug: string; id: string }) => {
      if (tenant.domain) {
        // Handle both www and non-www versions
        const domain = tenant.domain.replace(/^www\./, '')
        newCache[domain] = {
          slug: tenant.slug,
          id: tenant.id,
        }
        newCache[`www.${domain}`] = {
          slug: tenant.slug,
          id: tenant.id,
        }
      }
    })

    tenantCache = newCache
    lastCacheUpdate = Date.now()
    
    return tenantCache
  } catch (error) {
    console.error('Failed to refresh tenant cache:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')

  if (!hostname) {
    return NextResponse.next()
  }

  // Skip middleware for admin routes
  if (hostname.includes('admin') || request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Skip for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next()
  }

  // Refresh cache if needed
  if (Date.now() - lastCacheUpdate > CACHE_TTL || Object.keys(tenantCache).length === 0) {
    const newCache = await refreshTenantCache()
    if (!newCache) {
      // If cache refresh fails, continue with existing cache
      console.error('Failed to refresh tenant cache')
    }
  }

  // Clean hostname (remove port in development)
  const cleanHostname = hostname.split(':')[0]

  // Find matching tenant
  const tenant = tenantCache[cleanHostname]

  if (tenant) {
    // Clone the request URL and modify it
    const url = request.nextUrl.clone()
    
    // Rewrite the URL to include the tenant slug
    // This assumes your folder structure is /src/app/(sites)/[tenant]/page.tsx
    url.pathname = `/${tenant.slug}${request.nextUrl.pathname}`
    
    // Add tenant information to headers for use in the application
    const response = NextResponse.rewrite(url)
    response.headers.set('x-tenant-id', tenant.id)
    response.headers.set('x-tenant-slug', tenant.slug)
    
    return response
  }

  // No matching tenant found - could redirect to a default page or show an error
  // For now, we'll just continue to next middleware/route handler
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}
