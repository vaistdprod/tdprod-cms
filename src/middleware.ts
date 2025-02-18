import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This map will be populated by the createTenant endpoint
// and can be updated through an API endpoint if needed
const SITE_MAPPINGS: Record<string, string> = {
  'drsarah.test': 'site1',
  'pediatric-clinic.test': 'site2',
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')

  if (!hostname) {
    return NextResponse.next()
  }

  // Find matching tenant
  for (const [domain, siteId] of Object.entries(SITE_MAPPINGS)) {
    if (hostname.includes(domain)) {
      return NextResponse.rewrite(new URL(`/${siteId}${request.nextUrl.pathname}`, request.url))
    }
  }

  // Default to the admin interface
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
