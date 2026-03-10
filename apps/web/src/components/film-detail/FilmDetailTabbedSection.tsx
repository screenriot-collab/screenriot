'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type {
  TabbedSectionMock,
  TabbedSectionSynopsis,
  TabbedSectionCasting,
  TabbedSectionProduction,
  ProductionStage,
  UpdateItem,
} from '@/markup/film-detail';
import { createCastingVote, fetchMyCastingVotes } from '@/lib/films-api';
import { IMAGES } from '@/lib/constants';

type TabId = 'synopsis' | 'casting' | 'production' | 'updates';

const TABS: { id: TabId; label: string; badgeKey?: 'updatesCount' }[] = [
  { id: 'synopsis', label: 'Synopsis' },
  { id: 'casting', label: 'Casting Vote' },
  { id: 'production', label: 'Production' },
  { id: 'updates', label: 'Updates', badgeKey: 'updatesCount' },
];

function SynopsisContent({ data }: { data: TabbedSectionSynopsis }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-white">Story Synopsis</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">{data.storySynopsis}</p>
      </div>
      <div>
        <h3 className="text-base font-semibold text-white">Why This Film Matters</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-300">{data.whyMatters}</p>
      </div>
      <div>
        <h3 className="text-base font-semibold text-white">Budget Breakdown</h3>
        <ul className="mt-3 space-y-2">
          {data.budgetBreakdown.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="font-medium text-white">{item.percent}%</span>
              <span>-</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CastingContent({ data, filmId }: { data: TabbedSectionCasting; filmId?: string }) {
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function loadMyVotes() {
      if (!filmId || !session?.accessToken) return;
      try {
        const res = await fetchMyCastingVotes(filmId, session.accessToken as string | undefined);
        setVotedIds(res.optionIds ?? []);
      } catch {
        // ignore, keep local state only
      }
    }

    void loadMyVotes();
  }, [filmId, session?.accessToken]);

  async function handleVote(optionId: string) {
    if (votedIds.includes(optionId) || submittingId === optionId) return;

    // If filmId is missing (e.g. mock data without API), keep local-only toggle
    if (!filmId) {
      setVotedIds((prev) => (prev.includes(optionId) ? prev : [...prev, optionId]));
      return;
    }

    if (!session?.accessToken) {
      router.push('/login');
      return;
    }

    try {
      setSubmittingId(optionId);
      setError(null);
      await createCastingVote(filmId, optionId, session.accessToken as string | undefined);
      setVotedIds((prev) => (prev.includes(optionId) ? prev : [...prev, optionId]));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to submit vote';
      if (message.toLowerCase().includes('already voted')) {
        setVotedIds((prev) => (prev.includes(optionId) ? prev : [...prev, optionId]));
      } else {
        setError(message);
      }
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white">{data.title}</h3>
        <p className="mt-1 text-sm text-gray-400">{data.subtitle}</p>
      </div>
      <ul className="space-y-4">
        {data.cast.map((actor) => {
          const alreadyVoted = votedIds.includes(actor.id);
          const isSubmitting = submittingId === actor.id;
          const disabled = alreadyVoted || isSubmitting;
          return (
            <li
              key={actor.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{actor.name}</p>
                <p className="text-sm text-gray-400">{actor.role}</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
                    style={{ width: `${actor.votePercent}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => {
                    void handleVote(actor.id);
                  }}
                  disabled={disabled}
                  aria-disabled={disabled}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    alreadyVoted
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  aria-pressed={alreadyVoted}
                  aria-label={`Vote for ${actor.name}`}
                >
                  <img src={IMAGES.icons.starFilled} alt="" width={16} height={16} className="h-4 w-4" aria-hidden />
                  Vote
                </button>
                <span className="text-xs text-gray-500">{actor.votes} votes</span>
              </div>
            </li>
          );
        })}
      </ul>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <img src={IMAGES.icons.lightbulb} alt="" width={20} height={20} className="h-5 w-5 shrink-0" aria-hidden />
        <p className="text-sm text-amber-200/90">{data.tip}</p>
      </div>
    </div>
  );
}

function ProductionContent({ data }: { data: TabbedSectionProduction }) {
  function stageIcon(stage: ProductionStage) {
    if (stage.status === 'completed') {
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <img src={IMAGES.icons.check} alt="" width={16} height={16} className="h-4 w-4" aria-hidden />
        </span>
      );
    }
    if (stage.status === 'in_progress') {
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-sky-500 text-sky-400" />
      );
    }
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 text-white/40" />
    );
  }

  const statusLabel: Record<ProductionStage['status'], string> = {
    completed: 'Completed',
    in_progress: 'In Progress',
    upcoming: 'Upcoming',
    planned: 'Planned',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-white">{data.title}</h3>
      <ul className="space-y-3">
        {data.stages.map((stage) => (
          <li
            key={stage.id}
            className={`flex items-center gap-4 rounded-lg border p-4 ${
              stage.status === 'in_progress'
                ? 'border-sky-500/50 bg-sky-500/5'
                : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            {stageIcon(stage)}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{stage.title}</p>
              <p className="text-sm text-gray-400">
                {stage.period} - {statusLabel[stage.status]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpdatesContent({ items }: { items: UpdateItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-gray-500">{item.date}</p>
          <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}

interface FilmDetailTabbedSectionProps {
  data: TabbedSectionMock;
  filmId?: string;
}

export function FilmDetailTabbedSection({ data, filmId }: FilmDetailTabbedSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>('synopsis');
  const updatesCount = data.updates.items.length;

  return (
    <section className="rounded-xl border border-white/10 bg-screenriot-bg-card" aria-labelledby="tabbed-section-heading">
      <h2 id="tabbed-section-heading" className="sr-only">
        Project details
      </h2>
      <div className="border-b border-white/10 px-6 pt-4">
        <div
          className="flex flex-wrap gap-1"
          role="tablist"
          aria-label="Content sections"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const badge = tab.badgeKey && tab.badgeKey === 'updatesCount' ? updatesCount : null;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {badge != null && badge > 0 && (
                  <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-6">
        <div
          id="panel-synopsis"
          role="tabpanel"
          aria-labelledby="tab-synopsis"
          hidden={activeTab !== 'synopsis'}
        >
          {activeTab === 'synopsis' && <SynopsisContent data={data.synopsis} />}
        </div>
        <div
          id="panel-casting"
          role="tabpanel"
          aria-labelledby="tab-casting"
          hidden={activeTab !== 'casting'}
        >
          {activeTab === 'casting' && <CastingContent data={data.castingVote} filmId={filmId} />}
        </div>
        <div
          id="panel-production"
          role="tabpanel"
          aria-labelledby="tab-production"
          hidden={activeTab !== 'production'}
        >
          {activeTab === 'production' && <ProductionContent data={data.production} />}
        </div>
        <div
          id="panel-updates"
          role="tabpanel"
          aria-labelledby="tab-updates"
          hidden={activeTab !== 'updates'}
        >
          {activeTab === 'updates' && <UpdatesContent items={data.updates.items} />}
        </div>
      </div>
    </section>
  );
}
