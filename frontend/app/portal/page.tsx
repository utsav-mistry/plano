import Link from 'next/link';

const portalLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/subscriptions', label: 'My Subscriptions' },
    { href: '/invoices', label: 'My Invoices' },
    { href: '/profile', label: 'Profile' },
];

export default function PortalHomePage() {
    return (
        <div className="min-h-screen bg-bg-page px-6 py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-text-primary">Portal Workspace</h1>
                <p className="mt-2 text-text-secondary">
                    This is the route-based portal entrypoint. Existing modules remain unchanged during migration.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portalLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-card border border-border bg-bg-surface px-5 py-4 hover:border-plano-300 transition-colors"
                        >
                            <div className="text-sm font-semibold text-text-primary">{link.label}</div>
                            <div className="text-xs text-text-secondary mt-1">Open {link.href}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
