import { useNavigate, useParams } from 'react-router-dom';
import { useFilmPageEdit } from '@/hooks/useFilmPageEdit';
import { canEditPage } from '@/lib/filmPageForm';
import {
  FilmPageEditMeta,
  FilmPageEditPosterVideo,
  FilmPageEditTrending,
  FilmPageEditPledgeVoting,
  FilmPageEditTreatment,
  FilmPageEditMainCharacters,
  FilmPageEditKeyCrew,
  FilmPageEditSampleScenes,
  FilmPageEditScreenplayScore,
  FilmPageEditAiAnalysis,
  FilmPageEditSynopsisTab,
  FilmPageEditCastingVote,
  FilmPageEditProduction,
  FilmPageEditUpdates,
  FilmPageEditInvestmentTiers,
} from '@/components/films';

export default function FilmPageEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    detail,
    loading,
    error,
    form,
    setForm,
    saving,
    uploadingSlot,
    handleFileUpload,
    handleSubmit,
  } = useFilmPageEdit(id);

  const film = detail?.film;
  const allowed = film ? canEditPage(film.status) : false;

  if (loading) {
    return <div className="text-sm text-gray-400">Loading…</div>;
  }

  if (!detail || !film) {
    return (
      <div
        className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400"
        role="alert"
      >
        {error || 'Film not found.'}
      </div>
    );
  }

  if (!allowed) {
    return (
      <>
        <button
          type="button"
          onClick={() => navigate('/film-pages')}
          className="mb-4 text-sm text-gray-400 hover:text-white"
        >
          ← Back to Film pages
        </button>
        <div
          className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-300"
          role="alert"
        >
          Film page can only be edited when status is Approved, Fundraising,
          Funded or Closed. Current status: {film.status}.
        </div>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/film-pages')}
        className="mb-4 text-sm text-gray-400 hover:text-white"
      >
        ← Back to Film pages
      </button>

      <h1 className="text-2xl font-bold text-white">Edit film page</h1>
      <p className="mt-1 text-sm text-gray-500">
        Public page for: {film.title} / {film.slug}
      </p>

      {error && (
        <p
          className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-6xl">
        <div className="fixed right-6 top-4 z-20 flex gap-2 rounded-md border border-white/10 bg-admin-bg/95 p-2 shadow-lg backdrop-blur">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-admin-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-admin-accent/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/film-pages')}
            className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
          >
            Cancel
          </button>
        </div>

        <FilmPageEditMeta
          form={form}
          setForm={setForm}
          slugDisplay={form.slug ?? film.slug ?? '—'}
        />

        <FilmPageEditPosterVideo
          detail={detail}
          uploadingSlot={uploadingSlot}
          onFileUpload={handleFileUpload}
        />

        <FilmPageEditTrending form={form} setForm={setForm} />

        <FilmPageEditPledgeVoting form={form} setForm={setForm} />

        <FilmPageEditTreatment form={form} setForm={setForm} />

        <FilmPageEditMainCharacters form={form} setForm={setForm} />

        <FilmPageEditKeyCrew form={form} setForm={setForm} />

        <FilmPageEditSampleScenes form={form} setForm={setForm} />

        <FilmPageEditScreenplayScore form={form} setForm={setForm} />

        <FilmPageEditAiAnalysis film={film} form={form} setForm={setForm} />

        <FilmPageEditSynopsisTab form={form} setForm={setForm} film={film} />

        <FilmPageEditCastingVote form={form} setForm={setForm} />

        <FilmPageEditProduction form={form} setForm={setForm} />

        <FilmPageEditUpdates form={form} setForm={setForm} />

        <FilmPageEditInvestmentTiers form={form} setForm={setForm} />
      </form>
    </>
  );
}
