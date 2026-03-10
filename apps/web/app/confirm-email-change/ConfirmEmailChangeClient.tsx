'use client';

import { useEffect, useState } from 'react';
import { confirmEmailChange } from '@/lib/profile-api';

type Props = {
  token: string;
};

export function ConfirmEmailChangeClient({ token }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing confirmation link. Check your email for the correct link.');
      return;
    }
    setStatus('loading');
    confirmEmailChange(token)
      .then(() => {
        setStatus('success');
        setMessage('Email updated. You can now sign in with your new email address.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Invalid or expired link. Request a new email change from your profile.');
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
