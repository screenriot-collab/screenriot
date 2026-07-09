'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createContribution } from '@/lib/contributions-api';

interface NewContributionFormProps {
  filmId: string;
  accessToken: string;
}

export function NewContributionForm({ filmId, accessToken }: NewContributionFormProps) {
  const router = useRouter();
  const [field, setField] = useState('synopsis');
  const [newValue, setNewValue] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) {
      setError('Please provide the new value.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const changes = { [field]: newValue };
      await createContribution({ filmId, changes, comment }, accessToken);
      router.push('/dashboard/contributions');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-white/10 bg-screenriot-bg-card p-6">
      {error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="field" className="block text-sm font-medium text-gray-300">
          Field to update
        </label>
        <select
          id="field"
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-sm text-white focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
        >
          <option value="title" className="bg-screenriot-bg-card text-white">Title</option>
          <option value="logline" className="bg-screenriot-bg-card text-white">Logline</option>
          <option value="synopsis" className="bg-screenriot-bg-card text-white">Synopsis</option>
          <option value="genre" className="bg-screenriot-bg-card text-white">Genre</option>
          <option value="directorName" className="bg-screenriot-bg-card text-white">Director Name</option>
          {/* We can add more fields depending on what we want them to edit */}
        </select>
      </div>

      <div>
        <label htmlFor="newValue" className="block text-sm font-medium text-gray-300">
          New Value
        </label>
        <textarea
          id="newValue"
          rows={5}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Enter the proposed new content here..."
          className="mt-1 block w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-sm text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-300">
          Comment (Optional)
        </label>
        <textarea
          id="comment"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Why are you making this change? (e.g. 'Updated synopsis as the other one was outdated')"
          className="mt-1 block w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-sm text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-screenriot-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
