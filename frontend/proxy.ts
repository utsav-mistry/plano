import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isAdminPath = pathname.startsWith('/admin');
    const isPortalPath = pathname.startsWith('/portal');

    if (!isAdminPath && !isPortalPath) {
        return NextResponse.next();
    }

    // Avoid hard auth redirects here because cookie visibility differs by subdomain in production.
    // Access control is handled by role-aware layouts and API auth checks.
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/portal/:path*'],
};