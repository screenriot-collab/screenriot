'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Props = {
  token: string;
};

export function VerifyEmailClient({ token }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification link. Check your email for the correct link.');
      return;
    }
    setStatus('loading');
    fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          setStatus('success');
          setMessage('Email confirmed. You can now use your account.');
        } else {
          setStatus('error');
          setMessage(data.message ?? 'Invalid or expired link. Request a new confirmation email from your profile.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Try again or request a new link from your profile.');
      });
  }, [token]);

  if (status === 'idle') return null;
  if (status === 'loading') {
    return <p className="mt-4 text-screenriot-muted">Checking link…</p>;
  }
  if (status === 'success') {
    return (
      <p className="mt-4 text-screenriot-accent-blue" role="status">
        {message}
      </p>
    );
  }
  return (
    <p className="mt-4 text-red-400" role="alert">
      {message}
    </p>
  );
}
