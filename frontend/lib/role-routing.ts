export const normalizeRole = (role?: string | null) => String(role || '').trim().toLowerCase();

export const isAdminRole = (role?: string | null) => {
    const normalized = normalizeRole(role);
    return normalized === 'admin' || normalized === 'internal_user';
};

export const isPortalRole = (role?: string | null) => normalizeRole(role) === 'portal_user';

export const defaultRouteForRole = (role?: string | null) => {
    if (isAdminRole(role)) return '/admin/dashboard';
    if (isPortalRole(role)) return '/portal';
    return '/login';
};
