'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '@/lib/profile-api';

const schema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '' },
  });

  async function onSubmit(data: FormData) {
    if (!token) {
      setError('Invalid or missing reset link. Request a new one from the sign-in page.');
      return;
    }
    setError('');
    try {
      await resetPassword(token, data.newPassword);
      setDone(true);
    } catch {
      setError('Invalid or expired link. Request a new password reset.');
    }
  }

  if (!token) {
    return (
      <div className="mt-4">
        <p className="text-red-400" role="alert">
          Missing reset link. Use the link from your email or{' '}
          <Link href="/forgot-password" className="underline">
            request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <p className="mt-4 text-screenriot-accent-blue" role="status">
        Password updated. You can now sign in with your new password.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-white">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          className="mt-1 w-full rounded border border-white/20 bg-screenriot-bg px-3 py-2 text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
          aria-invalid={!!error}
          {...register('newPassword')}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-screenriot-accent-blue px-4 py-2 font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg disabled:opacity-50"
      >
        {isSubmitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
