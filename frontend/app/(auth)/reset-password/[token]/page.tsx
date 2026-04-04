import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-plano-600" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
