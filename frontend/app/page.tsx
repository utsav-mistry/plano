import { redirect } from 'next/navigation';

export default function Home() {
  // Simple redirect for now. In a real app we'd check session
  redirect('/login');
  
  return null;
}
