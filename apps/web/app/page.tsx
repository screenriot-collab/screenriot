import Link from 'next/link';
import { STATS, HOW_IT_WORKS } from '@/markup/home';
import { IMAGES } from '@/lib/constants';
import { HomeHeroAndFilms } from '@/components/home/HomeHeroAndFilms';

function HowItWorksIcon({ icon }: { icon: 'search' | 'folder' | 'plus' }) {
  const src =
    icon === 'search'
      ? IMAGES.icons.search
      : icon === 'folder'
        ? IMAGES.icons.folder
        : IMAGES.icons.plus;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      width={24}
      height={24}
      className="h-6 w-6 shrink-0"
      aria-hidden
    />
  );
}

export default function HomePage() {
  return (
    <main>
      <HomeHeroAndFilms />

      <section className="border-y border-white/10 bg-screenriot-bg-elevated px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-screenriot-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-white">{HOW_IT_WORKS.title}</h2>
          <p className="mt-2 text-screenriot-muted">{HOW_IT_WORKS.subtitle}</p>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {HOW_IT_WORKS.steps.map((step) => (
              <div key={step.title}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-screenriot-accent-blue/20 text-screenriot-accent-blue">
                  <HowItWorksIcon icon={step.icon} />
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-screenriot-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <Link
            href={HOW_IT_WORKS.ctaHref}
            className="mt-10 inline-block rounded-lg bg-screenriot-accent px-5 py-2.5 font-medium text-screenriot-bg hover:bg-screenriot-accent/90 focus:outline-none"
          >
            {HOW_IT_WORKS.ctaLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
