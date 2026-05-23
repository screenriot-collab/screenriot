import Link from 'next/link';
import { STATS, HOW_IT_WORKS } from '@/markup/home';
import { HomeHeroAndFilms } from '@/components/home/HomeHeroAndFilms';
import { StrokeIcon } from '@/components/ui/stroke-icon';
import type { StrokeIconName } from '@/components/ui/stroke-icon';

export default function HomePage() {
  return (
    <main>
      <HomeHeroAndFilms />

      <section
        className="border-y border-white/10 bg-screenriot-accent-blue/5 px-6 py-16"
        aria-labelledby="home-stats-heading"
      >
        <h2 id="home-stats-heading" className="sr-only">
          Platform statistics
        </h2>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-screenriot-accent-blue sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-screenriot-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-white">{HOW_IT_WORKS.title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-screenriot-muted">
            {HOW_IT_WORKS.subtitle}
          </p>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS.steps.map((step) => (
              <div key={step.title}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-screenriot-accent-blue/10">
                  <StrokeIcon
                    name={step.icon as StrokeIconName}
                    className="h-8 w-8 text-screenriot-accent-blue"
                  />
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-screenriot-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <Link
            href={HOW_IT_WORKS.ctaHref}
            className="mt-10 inline-block rounded-lg bg-screenriot-accent-blue px-5 py-2.5 font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
          >
            {HOW_IT_WORKS.ctaLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
