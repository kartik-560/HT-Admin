import { NextRequest, NextResponse } from 'next/server';

export function middleware(req) {
  const pathname = req.nextUrl.pathname;
  
  // Get basicAuth from cookies
  const basicAuth = req.cookies.get('basicAuth')?.value;

  console.log('Middleware - pathname:', pathname, 'hasAuth:', !!basicAuth);

  // Public routes
  const publicRoutes = ['/login', '/'];

  // If accessing admin and no auth, redirect to login
  if (pathname.startsWith('/admin') && !basicAuth) {
    console.log('No auth, redirecting to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If logged in and accessing login, redirect to admin
  if (pathname === '/login' && basicAuth) {
    console.log('Already authenticated, redirecting to admin');
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // If accessing home page, redirect based on auth
  if (pathname === '/' && basicAuth) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
  if (pathname === '/' && !basicAuth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/'],
};
