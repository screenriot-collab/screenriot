import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, '..');
config({ path: resolve(apiDir, '../../.env') });

const requireApi = createRequire(pathToFileURL(resolve(apiDir, 'package.json')).href);
const { PrismaClient } = requireApi(resolve(apiDir, 'node_modules/.prisma/client'));
const { PrismaPg } = requireApi('@prisma/adapter-pg');

const FILM_ID = process.argv[2] ?? 'cmn21hy1l00001e9prxe22s7f';

const screenplayScore = {
  aiOverall: 87,
  expertOverall: 92,
  categories: [
    { name: 'Pacing', aiScore: 85, expertScore: 90 },
    { name: 'Character Arcs', aiScore: 90, expertScore: 95 },
    { name: 'Dialogue', aiScore: 88, expertScore: 89 },
    { name: 'Structure', aiScore: 92, expertScore: 94 },
    { name: 'Originality', aiScore: 95, expertScore: 98 },
    { name: 'Emotional Impact', aiScore: 82, expertScore: 88 },
    { name: 'Commercial Potential', aiScore: 84, expertScore: 91 },
    { name: 'Genre Execution', aiScore: 89, expertScore: 90 },
    { name: 'Audience Appeal', aiScore: 81, expertScore: 87 },
  ],
};

const aiAnalysis = {
  overallScore: 88,
  marketInsights: [
    { id: '1', label: 'Popularity & Trend', value: '87', description: "Based on similar films' performance" },
    { id: '2', label: 'Global Appeal', value: '82', description: 'Strong international resonance' },
    { id: '3', label: 'Fan Buzz', value: '91', description: 'High social media engagement' },
    { id: '4', label: 'Topicality', value: '88', description: 'Align with current trends' },
    {
      id: '5',
      label: 'Genre Insights',
      value: 'Strong',
      description: 'Sci-Fi Thriller trending +24% in North America, +18% internationally',
    },
  ],
  teamTalent: [
    { id: '1', label: 'Crew Experience', value: '89', description: 'Proven track record in genre' },
    { id: '2', label: 'Talent Draw', value: '85', description: 'Strong cast & crew appeal' },
    { id: '3', label: 'Series Potential', value: 'High', description: 'Franchise opportunity identified' },
  ],
  investmentMetrics: [
    { id: '1', label: 'Expected Return', value: '18-24%', description: 'Conservative projection' },
    { id: '2', label: 'Investment Risk', value: 'Medium', description: 'Balanced risk-reward profile' },
    { id: '3', label: 'Community Interest', value: '93', description: 'Exceptional fan enthusiasm' },
    { id: '4', label: 'Festival / Awards', value: '78', description: 'Good recognition potential' },
    {
      id: '5',
      label: 'Platform Suitability',
      value: 'Excellent',
      description: 'Perfect runtime & format for streaming platforms (Netflix, Apple TV+)',
    },
  ],
};

const similarFilms = [
  { id: '1', title: 'Ex Machina', boxOffice: '$240M', roi: '8.5x', rating: '92% Critical', matchPercent: 94 },
  { id: '2', title: 'Inception', boxOffice: '$836M', roi: '5.2x', rating: '87% Critical', matchPercent: 89 },
  { id: '3', title: 'Blade Runner 2049', boxOffice: '$259M', roi: '6.8x', rating: '88% Critical', matchPercent: 91 },
];

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: datasourceUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const film = await prisma.film.findUnique({
    where: { id: FILM_ID },
    select: { id: true, title: true, slug: true, pageContent: true },
  });
  if (!film) {
    console.error(`Film not found: ${FILM_ID}`);
    process.exit(1);
  }

  const existing =
    film.pageContent && typeof film.pageContent === 'object' && !Array.isArray(film.pageContent)
      ? film.pageContent
      : {};

  await prisma.film.update({
    where: { id: FILM_ID },
    data: {
      pageContent: {
        ...existing,
        screenplayScore,
        aiAnalysis,
        similarFilms,
      },
    },
  });

  console.log(`Updated: "${film.title}" (${film.slug})`);
  console.log(`Admin: http://localhost:3002/film-pages/${FILM_ID}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
