'use client';

import { useState } from 'react';
import type {
  TabbedSectionMock,
  TabbedSectionProduction,
  TabbedSectionSynopsis,
  ProductionStage,
  UpdateItem,
  FanVotingMock,
  VotingCategory,
  CommunityReview,
} from '@/markup/film-detail';
import { IMAGES } from '@/lib/constants';
import { VotingCategoryIcon } from '@/components/film-detail/film-detail-voting-icons';

type TabId = 'reviews' | 'budget' | 'production' | 'updates';

const TABS: { id: TabId; label: string; badgeKey?: 'updatesCount' }[] = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'budget', label: 'Budget' },
  { id: 'production', label: 'Production' },
  { id: 'updates', label: 'Updates', badgeKey: 'updatesCount' },
];

function computeOverallScore(categories: VotingCategory[]): number {
  const scored = categories.filter((c) => c.communityScore > 0);
  if (scored.length === 0) return 0;
  const sum = scored.reduce((acc, c) => acc + c.communityScore, 0);
  return Math.round((sum / scored.length) * 10) / 10;
}

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ReviewsContent({
  fanVoting,
  votesCount,
  averageScore,
  hasCommunityScore,
  communityReviews,
}: {
  fanVoting: FanVotingMock;
  votesCount: number;
  averageScore: number;
  hasCommunityScore: boolean;
  communityReviews: CommunityReview[];
}) {
  const categories = fanVoting.categories;
  const overall =
    averageScore > 0 ? averageScore : computeOverallScore(categories);

  if (!hasCommunityScore || overall <= 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white">Film Scores & Reviews</h3>
        <p className="text-sm text-screenriot-muted">
          No community scores yet. Use the Fan Voting section above to rate this project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white">Film Scores & Reviews</h3>
        <div className="mt-4 rounded-xl border border-screenriot-accent-blue/20 bg-gradient-to-br from-screenriot-accent-blue/10 to-screenriot-accent-blue/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white">Overall Community Score</h4>
              <p className="mt-1 text-sm text-screenriot-muted">{votesCount} total votes</p>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-screenriot-accent" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-3xl font-bold text-white">{overall.toFixed(1)}</span>
              <span className="text-xl text-screenriot-muted">/10</span>
            </div>
          </div>
          {categories.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-lg bg-screenriot-bg/50 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <VotingCategoryIcon icon={cat.icon} />
                      <p className="text-sm font-medium text-white">{cat.label}</p>
                    </div>
                    <span className="text-xl font-bold text-white">
                      {cat.communityScore > 0 ? cat.communityScore.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-screenriot-accent-blue transition-[width] duration-300"
                      style={{
                        width: `${Math.min(100, (cat.communityScore / cat.communityMax) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div>
        <h4 className="text-base font-semibold text-white">Community Reviews</h4>
        {communityReviews.length === 0 ? (
          <p className="mt-2 text-sm text-screenriot-muted">
            No written reviews yet. Fans can add an optional comment when they submit scores in Fan
            Voting above.
          </p>
        ) : (
          <ul className="mt-4 space-y-4" role="list">
            {communityReviews.map((review) => (
              <li
                key={review.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-screenriot-accent-blue/20 text-xs font-semibold text-screenriot-accent-blue"
                      aria-hidden
                    >
                      {review.authorInitials}
                    </span>
                    <div>
                      <p className="font-medium text-white">{review.authorName}</p>
                      <p className="text-xs text-screenriot-muted">{formatReviewDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-white">
                    <span>{review.rating.toFixed(1)}</span>
                    <span className="text-screenriot-muted">/10</span>
                  </div>
                </div>
                {review.reviewText ? (
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{review.reviewText}</p>
                ) : (
                  <p className="mt-3 text-sm italic text-screenriot-muted">Rated without a written review.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BudgetContent({ synopsis }: { synopsis: TabbedSectionSynopsis }) {
  const items = synopsis.budgetBreakdown ?? [];
  if (items.length === 0) {
    return (
      <p className="text-sm text-screenriot-muted">
        Budget breakdown is taken from the film application (step 4). No breakdown available yet.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-white">Budget Breakdown</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm"
          >
            <span className="text-gray-300">{item.label}</span>
            <span className="font-semibold text-white">{item.percent}%</span>
          </li>
        ))}
      </ul>
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
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-screenriot-accent-blue text-screenriot-accent-blue" />
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
                ? 'border-screenriot-accent-blue/50 bg-screenriot-accent-blue/5'
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
  fanVoting: FanVotingMock;
  hasCommunityScore: boolean;
  votesCount: number;
  averageScore: number;
  communityReviews: CommunityReview[];
}

function defaultTab(data: TabbedSectionMock, hasCommunityScore: boolean): TabId {
  if (hasCommunityScore) return 'reviews';
  if (data.synopsis.budgetBreakdown?.length) return 'budget';
  if (data.production.stages?.length) return 'production';
  if (data.updates.items?.length) return 'updates';
  return 'reviews';
}

export function FilmDetailTabbedSection({
  data,
  fanVoting,
  hasCommunityScore,
  votesCount,
  averageScore,
  communityReviews,
}: FilmDetailTabbedSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>(() => defaultTab(data, hasCommunityScore));
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
          id="panel-reviews"
          role="tabpanel"
          aria-labelledby="tab-reviews"
          hidden={activeTab !== 'reviews'}
        >
          {activeTab === 'reviews' && (
            <ReviewsContent
              fanVoting={fanVoting}
              votesCount={votesCount}
              averageScore={averageScore}
              hasCommunityScore={hasCommunityScore}
              communityReviews={communityReviews}
            />
          )}
        </div>
        <div
          id="panel-budget"
          role="tabpanel"
          aria-labelledby="tab-budget"
          hidden={activeTab !== 'budget'}
        >
          {activeTab === 'budget' && <BudgetContent synopsis={data.synopsis} />}
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
