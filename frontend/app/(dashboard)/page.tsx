// This file previously served the dashboard at /.
// The dashboard has been moved to /dashboard to avoid a route conflict
// with app/page.tsx (which Next.js requires to exist at the root).
import { redirect } from 'next/navigation';

export default function OldDashboardRoot() {
  redirect('/dashboard');
}
