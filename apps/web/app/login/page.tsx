import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Suspense fallback={<div className="text-screenriot-muted">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
