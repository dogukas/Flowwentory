import { NextResponse, type NextRequest } from 'next/server'

// Middleware — şu an pass-through (auth yönetimi client-side yapılıyor)
// Supabase publishable key formatı sunucu tarafında cookie okumayı desteklemiyor
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
