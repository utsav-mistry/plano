const ADMIN_HOSTS = new Set(['admin.planoo.tech']);
const PORTAL_HOSTS = new Set(['portal.planoo.tech']);

const getCurrentHost = () => {
    if (typeof window === 'undefined') return '';
    return window.location.hostname.toLowerCase();
};

export const isAdminHost = () => {
    const host = getCurrentHost();
    return ADMIN_HOSTS.has(host) || host.startsWith('admin.');
};

export const isPortalHost = () => {
    const host = getCurrentHost();
    return PORTAL_HOSTS.has(host) || host.startsWith('portal.');
};

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);

export const toAdminPath = (pathname: string, path: string) => {
    const normalizedPath = ensureLeadingSlash(path);

    // On admin subdomain URLs should stay unprefixed (/dashboard, /plans, ...)
    if (isAdminHost()) {
        return normalizedPath.startsWith('/admin/')
            ? normalizedPath.slice('/admin'.length)
            : normalizedPath === '/admin'
                ? '/'
                : normalizedPath;
    }

    // On main domain /admin/* should be preserved consistently.
    if (pathname.startsWith('/admin')) {
        return normalizedPath.startsWith('/admin') ? normalizedPath : `/admin${normalizedPath}`;
    }

    return normalizedPath;
};
