import type { Metadata } from 'next';
import {
  ARCHITECTURE_BLOCKS,
  FLOW_LEGEND,
  HOW_IT_WORKS_PAGE,
} from '@/markup/how-it-works';
import { StrokeIcon } from '@/components/ui/stroke-icon';
import type { StrokeIconName } from '@/components/ui/stroke-icon';

export const metadata: Metadata = {
  title: 'How It Works | Screen Riot',
  description:
    'ScreenRiot platform architecture: money flow, token flow, and KYC for filmmakers and fan-investors.',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-screenriot-bg">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {HOW_IT_WORKS_PAGE.title}
          </h1>
          <p className="mt-2 text-lg text-screenriot-muted">
            {HOW_IT_WORKS_PAGE.subtitle}
          </p>
        </header>

        <section
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Platform architecture blocks"
        >
          {ARCHITECTURE_BLOCKS.map((block) => (
            <article
              key={block.id}
              className={`rounded-xl border-2 bg-screenriot-bg-card p-5 ${block.borderColorClass}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white"
                  aria-hidden
                >
                  <StrokeIcon
                    name={block.iconKey as StrokeIconName}
                    className="h-6 w-6"
                  />
                </span>
                <h2 className="text-lg font-semibold text-white">
                  {block.title}
                </h2>
              </div>
              <ul className="mt-4 space-y-2" role="list">
                {block.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 text-sm text-screenriot-muted"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section
          className="mt-12 rounded-xl border border-white/10 bg-screenriot-bg-elevated px-6 py-5"
          aria-label="Flow legend"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-screenriot-muted">
            Flow Legend
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2 sm:gap-x-12" role="list">
            {FLOW_LEGEND.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-sm text-white"
              >
                <span
                  className={`h-3 w-8 shrink-0 rounded ${item.colorClass}`}
                  aria-hidden
                />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
