import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Middleware now does minimal work - just passes requests through
    // JWT decoding happens in withRoute wrapper for security

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',  // Match all API routes
        '/((?!_next/static|_next/image|favicon.ico).*)',  // Match all other routes except static
    ],
};
