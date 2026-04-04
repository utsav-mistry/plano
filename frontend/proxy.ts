import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isAdminPath = pathname.startsWith('/admin');
    const isPortalPath = pathname.startsWith('/portal');
    const isPortalRoot = pathname === '/portal';

    if (!isAdminPath && !isPortalPath) {
        return NextResponse.next();
    }

    if (isPortalRoot) {
        return NextResponse.next();
    }

    const refreshToken = req.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/portal/:path*'],
};