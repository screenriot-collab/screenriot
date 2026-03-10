'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '@/lib/profile-api';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await forgotPassword(data.email);
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  if (done) {
    return (
      <p className="mt-4 text-screenriot-accent-blue" role="status">
        If an account exists with that email, you will receive a password reset link.
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
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded border border-white/20 bg-screenriot-bg px-3 py-2 text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
          aria-invalid={!!error}
          {...register('email')}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-screenriot-accent-blue px-4 py-2 font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg disabled:opacity-50"
      >
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
}
