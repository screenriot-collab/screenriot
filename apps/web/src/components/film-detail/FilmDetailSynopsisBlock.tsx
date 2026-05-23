'use client';

import type { TabbedSectionSynopsis } from '@/markup/film-detail';
import { ProposeEditPencil } from '@/components/film-propose/ProposeEditPencil';

interface FilmDetailSynopsisBlockProps {
  data: TabbedSectionSynopsis;
}

export function FilmDetailSynopsisBlock({ data }: FilmDetailSynopsisBlockProps) {
  const storySynopsis = data.storySynopsis?.trim() ?? '';
  const whyMatters = data.whyMatters?.trim() ?? '';

  if (!storySynopsis && !whyMatters) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="film-synopsis-heading">
      <h2 id="film-synopsis-heading" className="sr-only">
        Story synopsis
      </h2>
      {storySynopsis ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-white">Story Synopsis</h3>
            <ProposeEditPencil
              target={{
                path: 'pageContent.tabbedSection.synopsis.storySynopsis',
                label: 'Story Synopsis',
                oldValue: storySynopsis,
              }}
            />
          </div>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-screenriot-muted">
            {storySynopsis}
          </p>
        </div>
      ) : null}
      {whyMatters ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-white">Why This Film Matters</h3>
            <ProposeEditPencil
              target={{
                path: 'pageContent.tabbedSection.synopsis.whyMatters',
                label: 'Why This Film Matters',
                oldValue: whyMatters,
              }}
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-screenriot-muted">{whyMatters}</p>
        </div>
      ) : null}
    </section>
  );
}
