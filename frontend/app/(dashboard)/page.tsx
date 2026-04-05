// FIX [AUDIT-C2]: This page previously hard-redirected to /dashboard.
// Now it redirects admin/internal users to /dashboard
// and is unreachable by portal users (the layout blocks them).
import { redirect } from 'next/navigation';

export default function OldDashboardRoot() {
  // The (dashboard) layout already guards that only admin/internal_user can reach here.
  // Redirect to the canonical admin dashboard path.
  redirect('/dashboard');
}
