'use client';

import { Suspense } from 'react';
import type { FilmDetailMock } from '@/markup/film-detail';
import { FilmProposeEditProvider } from './FilmProposeEditContext';
import { FilmDetailHeroSection } from '@/components/film-detail/FilmDetailHeroSection';
import { FilmDetailSynopsisBlock } from '@/components/film-detail/FilmDetailSynopsisBlock';
import { FilmDetailScreenplayScoreSection } from '@/components/film-detail/FilmDetailScreenplayScoreSection';
import { FilmDetailAIAnalysisSection } from '@/components/film-detail/FilmDetailAIAnalysisSection';
import { FilmDetailFanVotingSection } from '@/components/film-detail/FilmDetailFanVotingSection';
import { FilmDetailCommunityDiscussionSection } from '@/components/film-detail/FilmDetailCommunityDiscussionSection';
import { FilmDetailStoryCharactersSection } from '@/components/film-detail/FilmDetailStoryCharactersSection';
import { FilmDetailKeyCrewSection } from '@/components/film-detail/FilmDetailKeyCrewSection';
import { FilmDetailSampleScenesSection } from '@/components/film-detail/FilmDetailSampleScenesSection';
import { FilmDetailTabbedSection } from '@/components/film-detail/FilmDetailTabbedSection';
import { FilmDetailSidebar } from '@/components/film-detail/FilmDetailSidebar';
import { FilmDonationCheckoutReturn } from '@/components/film-detail/FilmDonationCheckoutReturn';

interface FilmDetailWithProposeProps {
  film: FilmDetailMock;
  filmId?: string;
  slug: string;
  canPropose: boolean;
  accessToken?: string;
  previewBanner?: boolean;
}

export function FilmDetailWithPropose({
  film,
  filmId,
  slug,
  canPropose,
  accessToken,
  previewBanner = false,
}: FilmDetailWithProposeProps) {
  const proposeEnabled = canPropose && Boolean(filmId && accessToken);

  const content = (
    <div className="min-h-screen bg-screenriot-bg">
      {previewBanner && proposeEnabled && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-200">
          Preview mode — this matches your published page. Use the{' '}
          <span className="font-medium text-white">pencil</span> on any field to submit a redline
          edit for admin review.
        </div>
      )}
      {proposeEnabled && !previewBanner && (
        <div className="border-b border-screenriot-accent-blue/30 bg-screenriot-accent-blue/10 px-4 py-2 text-center text-sm text-blue-200">
          You are viewing your published film. Click the <strong>pencil</strong> to propose edits.
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Suspense fallback={null}>
          <FilmDonationCheckoutReturn filmSlug={slug} />
        </Suspense>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <main className="min-w-0 max-w-4xl flex-1">
            <FilmDetailHeroSection film={film} />
            <div className="mt-8">
              <FilmDetailSynopsisBlock data={film.tabbedSection.synopsis} />
            </div>
            {film.hasScreenplayScore ? (
              <div className="mt-10">
                <FilmDetailScreenplayScoreSection data={film.screenplayScore} />
              </div>
            ) : null}
            <div className="mt-10">
              <FilmDetailAIAnalysisSection
                data={film.aiAnalysis}
                hasAiMarketScore={film.hasAiMarketScore}
                similarFilms={film.similarFilms}
              />
            </div>
            <div className="mt-10">
              <FilmDetailStoryCharactersSection
                treatment={film.treatment}
                characters={film.mainCharacters}
              />
            </div>
            {film.keyCrewVisible && film.keyCrew.length > 0 ? (
              <div className="mt-10">
                <FilmDetailKeyCrewSection crew={film.keyCrew} />
              </div>
            ) : null}
            <div className="mt-10">
              <Suspense fallback={null}>
                <FilmDetailSampleScenesSection
                  data={film.sampleScenes}
                  filmId={filmId}
                  filmSlug={slug}
                />
              </Suspense>
            </div>
            <div className="mt-10">
              <FilmDetailFanVotingSection
                data={film.fanVoting}
                castingVote={film.tabbedSection.castingVote}
                filmId={filmId}
                filmSlug={slug}
                thoughtsPlaceholder={film.rateStory.thoughtsPlaceholder}
              />
            </div>
            <div className="mt-10">
              <FilmDetailTabbedSection
                data={film.tabbedSection}
                fanVoting={film.fanVoting}
                hasCommunityScore={film.hasCommunityScore}
                votesCount={film.sidebar.votesCount}
                averageScore={film.sidebar.averageScore}
                communityReviews={film.communityReviews}
              />
            </div>
            <div className="mt-10">
              <FilmDetailCommunityDiscussionSection
                data={film.communityDiscussion}
                filmId={filmId}
                filmSlug={slug}
              />
            </div>
          </main>
          <FilmDetailSidebar
            data={film.sidebar}
            filmId={filmId}
            slug={slug}
            hasCommunityScore={film.hasCommunityScore}
          />
        </div>
      </div>
    </div>
  );

  if (!proposeEnabled) {
    return content;
  }

  return (
    <FilmProposeEditProvider enabled filmId={filmId!} accessToken={accessToken!}>
      {content}
    </FilmProposeEditProvider>
  );
}
