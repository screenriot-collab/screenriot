'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function RegisterForm() {
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      role: 'fan',
      acceptTerms: false,
    },
  });

  async function onSubmit(data: RegisterInput) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
          acceptTerms: true,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError('root', {
          message: body.message ?? 'Registration failed',
        });
        return;
      }
      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signInRes?.error) {
        router.push('/login?registered=1');
        router.refresh();
        return;
      }
      router.push('/profile');
      router.refresh();
    } catch {
      setError('root', { message: 'Registration failed' });
    }
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <p className="text-sm text-red-600" role="alert">
            {errors.root.message}
          </p>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 aria-invalid:border-red-500"
            aria-invalid={!!errors.email}
            {...registerField('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 aria-invalid:border-red-500"
            aria-invalid={!!errors.password}
            {...registerField('password')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 aria-invalid:border-red-500"
            aria-invalid={!!errors.passwordConfirm}
            {...registerField('passwordConfirm')}
          />
          {errors.passwordConfirm && (
            <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
          )}
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Account type</span>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                value="fan"
                className="rounded border-gray-300"
                {...registerField('role')}
              />
              <span className="text-sm text-gray-900">Film-Fan</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                value="filmmaker"
                className="rounded border-gray-300"
                {...registerField('role')}
              />
              <span className="text-sm text-gray-900">Filmmaker + Fan</span>
            </label>
          </div>
        </div>
        <div>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300"
              aria-invalid={!!errors.acceptTerms}
              {...registerField('acceptTerms')}
            />
            <span className="text-sm text-gray-700">
              I accept the Platform Terms & Conditions
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
