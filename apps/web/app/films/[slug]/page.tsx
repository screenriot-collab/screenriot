import { getFilmDetailMock } from '@/markup/film-detail';
import { fetchFilmPageBySlug } from '@/lib/films-api';
import { apiFilmToFilmDetailMock } from '@/lib/film-page-mapper';
import { FilmDetailHeroSection } from '@/components/film-detail/FilmDetailHeroSection';
import { FilmDetailAIAnalysisSection } from '@/components/film-detail/FilmDetailAIAnalysisSection';
import { FilmDetailSimilarCard } from '@/components/film-detail/FilmDetailSimilarCard';
import { FilmDetailPledgeVotingSection } from '@/components/film-detail/FilmDetailPledgeVotingSection';
import { FilmDetailStoryCharactersSection } from '@/components/film-detail/FilmDetailStoryCharactersSection';
import { FilmDetailSampleScenesSection } from '@/components/film-detail/FilmDetailSampleScenesSection';
import { FilmDetailRateStorySection } from '@/components/film-detail/FilmDetailRateStorySection';
import { FilmDetailTabbedSection } from '@/components/film-detail/FilmDetailTabbedSection';
import { FilmDetailSidebar } from '@/components/film-detail/FilmDetailSidebar';

type PageProps = { params: Promise<{ slug: string }> };

export default async function FilmPage({ params }: PageProps) {
  const { slug } = await params;
  const apiFilm = await fetchFilmPageBySlug(slug);
  const defaultMock = getFilmDetailMock(slug);
  const film = apiFilm ? apiFilmToFilmDetailMock(apiFilm, defaultMock) : defaultMock;

  return (
    <div className="min-h-screen bg-screenriot-bg">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <main className="min-w-0 max-w-4xl flex-1">
          <FilmDetailHeroSection film={film} />

          <div className="mt-10">
            <FilmDetailAIAnalysisSection data={film.aiAnalysis} />
          </div>

          <section className="mt-10" aria-labelledby="similar-films-heading">
            <h2 id="similar-films-heading" className="text-lg font-semibold text-white">
              Similar Successful Films
            </h2>
            <ul className="mt-4 space-y-3">
              {film.similarFilms.map((f) => (
                <li key={f.id}>
                  <FilmDetailSimilarCard film={f} />
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10">
            <FilmDetailPledgeVotingSection data={film.pledgeVoting} filmId={apiFilm?.id} />
          </div>

          <div className="mt-10">
            <FilmDetailStoryCharactersSection treatment={film.treatment} characters={film.mainCharacters} />
          </div>

          <div className="mt-10">
            <FilmDetailSampleScenesSection data={film.sampleScenes} />
          </div>

          <div className="mt-10">
            <FilmDetailRateStorySection data={film.rateStory} />
          </div>

          <div className="mt-10">
            <FilmDetailTabbedSection data={film.tabbedSection} filmId={apiFilm?.id} />
          </div>
          </main>
          <FilmDetailSidebar
            data={film.sidebar}
            filmId={apiFilm?.id}
            slug={slug}
          />
        </div>
      </div>
    </div>
  );
}
