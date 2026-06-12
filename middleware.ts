import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // On the tarjam domain, redirect root to /translate
  if (host.includes('tarjam') && pathname === '/') {
    return NextResponse.redirect(new URL('/translate', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
