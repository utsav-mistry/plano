import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginForm from './LoginForm';

type LoginPageProps = {
    searchParams?: Promise<{ next?: string }> | { next?: string };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const resolvedSearchParams = await Promise.resolve(searchParams);
    const nextPath = resolvedSearchParams?.next;

    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-[#714b67]" />
                    <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">Loading login...</p>
                </div>
            }
        >
            <LoginForm nextPath={nextPath} />
        </Suspense>
    );
}
