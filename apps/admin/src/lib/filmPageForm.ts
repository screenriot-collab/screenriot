import {
  EDITABLE_PAGE_STATUSES,
  DEFAULT_PLEDGE_VOTING_CATEGORIES,
  CAST_TIER_LABELS,
} from '@/constants/films';
import type {
  AdminFilmDetail,
  FilmPageFormState,
  FilmPageUpdate,
  MainCharacterForm,
  KeyCrewMemberForm,
  CastingVoteForm,
  CastingVoteOptionForm,
  ProductionForm,
  ProductionStageForm,
  UpdateItemForm,
  SampleScenesForm,
  PledgeVotingForm,
  PledgeVotingCategoryForm,
  InvestmentTierForm,
  ScreenplayScoreForm,
  AiAnalysisForm,
  MetricForm,
  SimilarFilmForm,
} from '@/types/films';

export function canEditPage(status: string): boolean {
  return EDITABLE_PAGE_STATUSES.includes(status);
}

function mapMetrics(arr: unknown): MetricForm[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((m, i) => {
    const row = m as Record<string, unknown>;
    return {
      id: typeof row.id === 'string' ? row.id : `metric-${i}`,
      label: typeof row.label === 'string' ? row.label : '',
      value: typeof row.value === 'string' ? row.value : String(row.value ?? ''),
      description: typeof row.description === 'string' ? row.description : '',
    };
  });
}

export function roleLine(character: string, tier: string): string {
  const tierLabel = CAST_TIER_LABELS[tier] ?? tier;
  if (character && tierLabel) return `${character} · ${tierLabel}`;
  return character || tierLabel || '';
}

export function parseWishListCastToOptions(wishListRaw: unknown): CastingVoteOptionForm[] {
  if (!wishListRaw) return [];

  let rows: {
    actorName?: string;
    character?: string;
    role?: string;
    tier?: string;
    characterDescription?: string;
    status?: string;
  }[] = [];

  if (Array.isArray(wishListRaw)) {
    rows = wishListRaw;
  } else if (typeof wishListRaw === 'string' && wishListRaw.trim()) {
    rows = wishListRaw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ actorName: name }));
  }

  return rows
    .filter((row) => (row.actorName ?? '').trim())
    .map((row, index) => {
      const character = (row.character ?? row.role ?? '').trim();
      const tier = (row.tier ?? 'lead_protagonist').trim();
      const status = row.status === 'verified' ? 'verified' : 'wish_list';
      return {
        id: `wish-${index}`,
        name: (row.actorName ?? '').trim(),
        role: roleLine(character, tier),
        status,
        characterDescription: (row.characterDescription ?? '').trim(),
        votePercent: 0,
        votes: 0,
      };
    });
}

type Step3CastRow = {
  actorName?: string;
  actorEmail?: string;
  role?: string;
  character?: string;
  tier?: string;
  characterDescription?: string;
};

function mainCharactersFromDetail(
  pcMain: MainCharacterForm[] | undefined,
  step3Cast: Step3CastRow[],
): MainCharacterForm[] {
  if (pcMain && pcMain.length > 0) {
    return pcMain.map((c) => ({
      id: c.id ?? `cast-${Math.random().toString(36).slice(2, 9)}`,
      name: c.name ?? '',
      role: c.role ?? '',
      character: c.character,
      tier: c.tier,
      description: c.description ?? '',
      imageUrl: c.imageUrl ?? null,
      actorEmail: c.actorEmail ?? undefined,
    }));
  }
  return step3Cast.map((row: Step3CastRow, i: number) => {
    const actorName = (row.actorName ?? '').trim();
    const actorEmail = (row.actorEmail ?? '').trim();
    const character = (row.character ?? row.role ?? '').trim();
    const tier = (row.tier ?? 'lead_protagonist').trim();
    const name =
      actorName || (/@/.test(actorEmail) ? '—' : actorEmail || '—');
    return {
      id: `cast-${i}`,
      name,
      role: roleLine(character, tier),
      character,
      tier,
      description: (row.characterDescription ?? '').trim(),
      imageUrl: null,
      actorEmail: actorEmail || undefined,
    };
  });
}

type Step3CrewRow = {
  name?: string;
  position?: string;
  email?: string;
};

function keyCrewFromDetail(
  pcKeyCrew: KeyCrewMemberForm[] | undefined,
  step3Crew: Step3CrewRow[],
): KeyCrewMemberForm[] {
  if (pcKeyCrew && pcKeyCrew.length > 0) {
    return pcKeyCrew.map((c) => ({
      id: c.id ?? `crew-${Math.random().toString(36).slice(2, 9)}`,
      name: c.name ?? '',
      role: c.role ?? 'Other',
      description: c.description ?? '',
      email: c.email ?? undefined,
      imageUrl: c.imageUrl ?? null,
      tmdbBio: c.tmdbBio,
      tmdbBirthday: c.tmdbBirthday,
      tmdbPlaceOfBirth: c.tmdbPlaceOfBirth,
    }));
  }
  return step3Crew.map((row, i) => ({
    id: `crew-${i}`,
    name: (row.name ?? '').trim() || '—',
    role: (row.position ?? '').trim() || 'Other',
    description: '',
    email: (row.email ?? '').trim() || undefined,
    imageUrl: null,
  }));
}

export function buildFormFromDetail(res: AdminFilmDetail): FilmPageFormState {
  const f = res.film;
  const pc = (f.pageContent as Record<string, unknown> | null) ?? {};
  const treatment = (pc.treatment as { act1?: string; act2?: string }) ?? {};
  const tabSection = pc.tabbedSection as
    | {
        synopsis?: { storySynopsis?: string; whyMatters?: string };
        castingVote?: CastingVoteForm;
        production?: ProductionForm;
        updates?: { items?: UpdateItemForm[] };
      }
    | undefined;
  const tabSynopsis = (tabSection?.synopsis ?? {}) as {
    storySynopsis?: string;
    whyMatters?: string;
  };
  const tagsArr = (pc.tags as string[] | undefined) ?? [];
  const treatmentText = [treatment.act1, treatment.act2]
    .filter(Boolean)
    .join('\n\n');
  const pcMain = (pc.mainCharacters as MainCharacterForm[] | undefined) ?? [];
  const step3Cast = (f.step3?.cast ?? []).filter(
    (row: Step3CastRow) =>
      (row.actorName ?? '').trim() ||
      (row.actorEmail ?? '').trim() ||
      (row.character ?? row.role ?? '').trim(),
  );
  const mainCharacters = mainCharactersFromDetail(pcMain, step3Cast);

  const pcKeyCrew = (pc.keyCrew as KeyCrewMemberForm[] | undefined) ?? [];
  const step3Crew = (f.step3?.crew ?? []).filter(
    (row: Step3CrewRow) => (row.name ?? '').trim() || (row.position ?? '').trim() || (row.email ?? '').trim(),
  );
  const keyCrew = keyCrewFromDetail(pcKeyCrew, step3Crew);
  const keyCrewVisible = (pc.keyCrewVisible as boolean | undefined) ?? false;

  const existingCasting = tabSection?.castingVote as CastingVoteForm | undefined;
  const castingFromWishList = parseWishListCastToOptions(f.step3?.wishListCast);
  const castingVote: CastingVoteForm = {
    title: existingCasting?.title ?? 'Vote for Your Dream Cast',
    subtitle: existingCasting?.subtitle ?? '',
    tip:
      existingCasting?.tip ??
      'Tip: Casting decisions are influenced by community votes. The more you invest, the more weight your vote carries.',
    cast:
      existingCasting?.cast && existingCasting.cast.length > 0
        ? existingCasting.cast.map((c, index) => ({
            id: c.id ?? `cast-${index}`,
            name: c.name ?? '',
            role: c.role ?? '',
            status: c.status === 'verified' ? 'verified' : 'wish_list',
            characterDescription: c.characterDescription ?? '',
            votePercent:
              typeof c.votePercent === 'number' && !Number.isNaN(c.votePercent)
                ? c.votePercent
                : 0,
            votes:
              typeof c.votes === 'number' && !Number.isNaN(c.votes)
                ? c.votes
                : 0,
          }))
        : castingFromWishList,
  };

  const existingProduction = tabSection?.production as ProductionForm | undefined;
  const productionTitle = existingProduction?.title ?? 'Production Timeline';
  const productionStages: ProductionStageForm[] = Array.isArray(
    existingProduction?.stages,
  )
    ? existingProduction.stages.map((stage, index) => ({
        id: stage.id ?? `stage-${index}`,
        title: stage.title ?? '',
        period: stage.period ?? '',
        status:
          stage.status === 'completed' ||
          stage.status === 'in_progress' ||
          stage.status === 'upcoming' ||
          stage.status === 'planned'
            ? stage.status
            : 'planned',
      }))
    : [];

  const existingUpdates = (
    tabSection?.updates as { items?: UpdateItemForm[] } | undefined
  )?.items;
  const updatesItems: UpdateItemForm[] = Array.isArray(existingUpdates)
    ? existingUpdates.map((item, index) => ({
        id: item.id ?? `update-${index}`,
        date: item.date ?? '',
        title: item.title ?? '',
        description: item.description ?? '',
      }))
    : [];

  const existingSampleScenes = pc.sampleScenes as SampleScenesForm | undefined;
  const pagesFromPc = Array.isArray(existingSampleScenes?.pages)
    ? existingSampleScenes.pages.map((p, i) => ({
        id: p.id ?? `page-${i + 1}`,
        title: p.title ?? `Scene ${i + 1}`,
        content: p.content ?? '',
      }))
    : existingSampleScenes?.description?.trim()
      ? [{ title: 'Scene 1', content: existingSampleScenes.description }]
      : [{ title: 'Scene 1', content: '' }];
  const sampleScenes: SampleScenesForm = existingSampleScenes
    ? {
        title: existingSampleScenes.title ?? 'Script Sample',
        unlockMessage: existingSampleScenes.unlockMessage ?? '',
        pledgeAmount: 0,
        description: existingSampleScenes.description ?? '',
        pages: pagesFromPc,
        unlockedPageCount:
          typeof existingSampleScenes.unlockedPageCount === 'number'
            ? existingSampleScenes.unlockedPageCount
            : pagesFromPc.length,
        lockedPageCount:
          typeof existingSampleScenes.lockedPageCount === 'number'
            ? existingSampleScenes.lockedPageCount
            : 0,
        creditsPerPage:
          typeof existingSampleScenes.creditsPerPage === 'number'
            ? existingSampleScenes.creditsPerPage
            : 1,
      }
    : {
        title: 'Script Sample',
        unlockMessage: 'Sample scenes will be published when the filmmaker adds them.',
        pledgeAmount: 0,
        description: '',
        pages: [{ id: 'page-1', title: 'Scene 1', content: '' }],
        unlockedPageCount: 1,
        lockedPageCount: 0,
        creditsPerPage: 1,
      };

  const rawScreenplay = pc.screenplayScore as ScreenplayScoreForm | undefined;
  const screenplayScore: ScreenplayScoreForm = {
    aiOverall: typeof rawScreenplay?.aiOverall === 'number' ? rawScreenplay.aiOverall : 0,
    expertOverall:
      typeof rawScreenplay?.expertOverall === 'number' ? rawScreenplay.expertOverall : 0,
    categories: Array.isArray(rawScreenplay?.categories)
      ? rawScreenplay.categories.map((c) => ({
          name: c.name ?? '',
          aiScore: typeof c.aiScore === 'number' ? c.aiScore : 0,
          expertScore: typeof c.expertScore === 'number' ? c.expertScore : 0,
        }))
      : [],
  };

  const rawAi = pc.aiAnalysis as Record<string, unknown> | undefined;
  const aiAnalysis: AiAnalysisForm = {
    overallScore: typeof rawAi?.overallScore === 'number' ? rawAi.overallScore : 0,
    marketInsights: mapMetrics(rawAi?.marketInsights),
    teamTalent: mapMetrics(rawAi?.teamTalent),
    investmentMetrics: mapMetrics(rawAi?.investmentMetrics),
  };

  const similarFilms: SimilarFilmForm[] = Array.isArray(pc.similarFilms)
    ? (pc.similarFilms as SimilarFilmForm[]).map((s, i) => ({
        id: s.id ?? `similar-${i}`,
        title: s.title ?? '',
        boxOffice: s.boxOffice ?? '',
        roi: s.roi ?? '',
        rating: s.rating ?? '',
        matchPercent: typeof s.matchPercent === 'number' ? s.matchPercent : 0,
        posterUrl: s.posterUrl,
      }))
    : [];

  const sidebar = (pc.sidebar as { tiers?: unknown[] } | undefined) ?? {};
  const sidebarTiers: InvestmentTierForm[] = Array.isArray(sidebar.tiers)
    ? sidebar.tiers.map((t, i) => {
        const row = t as { id?: string; amount?: number; name?: string; benefits?: string[]; investorsCount?: number };
        return {
          id: row.id ?? `tier-${i}`,
          amount: typeof row.amount === 'number' ? row.amount : 0,
          name: typeof row.name === 'string' ? row.name : '',
          benefits: Array.isArray(row.benefits) ? row.benefits : [],
          investorsCount: typeof row.investorsCount === 'number' ? row.investorsCount : 0,
        };
      })
    : [];

  const existingPledge = pc.pledgeVoting as PledgeVotingForm | undefined;
  const pledgeVoting: PledgeVotingForm =
    existingPledge?.categories && existingPledge.categories.length > 0
      ? {
          title: existingPledge.title ?? 'Fan Voting',
          subtitle:
            existingPledge.subtitle?.includes('$') || !existingPledge.subtitle?.trim()
              ? 'Rate this project and vote for your dream cast • Voting is free'
              : existingPledge.subtitle,
          pledgeAmount: 0,
          categories: existingPledge.categories.map((c, i) => ({
            id: c.id ?? DEFAULT_PLEDGE_VOTING_CATEGORIES[i]?.id ?? `cat-${i}`,
            label: c.label ?? '',
            icon:
              (c.icon === 'story' || c.icon === 'script' || c.icon === 'casting'
                ? c.icon
                : 'story') as PledgeVotingCategoryForm['icon'],
            labelLeft: c.labelLeft ?? '',
            labelRight: c.labelRight ?? '',
            communityScore:
              typeof c.communityScore === 'number' ? c.communityScore : undefined,
            communityMax:
              typeof c.communityMax === 'number' ? c.communityMax : 10,
          })),
        }
      : {
          title: 'Fan Voting',
          subtitle: 'Rate this project and vote for your dream cast • Voting is free',
          pledgeAmount: 0,
          categories: DEFAULT_PLEDGE_VOTING_CATEGORIES.map((c) => ({ ...c })),
        };

  return {
    slug: f.slug ?? '',
    title: f.title ?? '',
    logline: f.logline ?? '',
    synopsis: f.synopsis ?? '',
    directorName: f.directorName ?? '',
    genre: f.genre ?? '',
    goalAmount: f.goalAmount != null ? Number(f.goalAmount) : undefined,
    deadline: f.deadline ? f.deadline.slice(0, 16) : '',
    posterUrl: f.posterUrl ?? '',
    trendingText: f.trendingText ?? '',
    cachedVotesCount: f.cachedVotesCount ?? undefined,
    cachedAverageScore:
      f.cachedAverageScore != null ? Number(f.cachedAverageScore) : undefined,
    pageContent: pc as Record<string, unknown>,
    pagePublished: f.pagePublished ?? false,
    treatment: treatmentText,
    storySynopsis: (tabSynopsis.storySynopsis as string) ?? '',
    whyMatters: (tabSynopsis.whyMatters as string) ?? '',
    tags: tagsArr.length ? tagsArr.join(', ') : '',
    mainCharacters,
    keyCrew,
    keyCrewVisible,
    castingVote,
    productionTitle,
    productionStages,
    updatesItems,
    sampleScenes,
    screenplayScore,
    aiAnalysis,
    similarFilms,
    pledgeVoting,
    sidebarTiers,
  };
}

export function buildFilmPageUpdatePayload(
  form: FilmPageFormState,
): FilmPageUpdate {
  const existing = form.pageContent ?? {};
  const tabbedSection = (existing.tabbedSection as Record<string, unknown>) ?? {};
  const synopsis = (tabbedSection.synopsis as Record<string, unknown>) ?? {};
  const castingVoteExisting = tabbedSection.castingVote as
    | CastingVoteForm
    | undefined;
  const productionExisting = tabbedSection.production as
    | ProductionForm
    | undefined;
  const updatesExisting = tabbedSection.updates as
    | { items?: UpdateItemForm[] }
    | undefined;
  const sampleScenesExisting = (existing as Record<string, unknown>)
    .sampleScenes as SampleScenesForm | undefined;
  const pledgeVotingExisting = (existing as Record<string, unknown>)
    .pledgeVoting as PledgeVotingForm | undefined;

  const defaultPledge = {
    title: 'Fan Voting',
    subtitle: 'Rate this project and vote for your dream cast • Voting is free',
    pledgeAmount: 0,
    categories: DEFAULT_PLEDGE_VOTING_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      icon: c.icon,
      labelLeft: c.labelLeft,
      labelRight: c.labelRight,
    })),
  };

  const existingSidebar = (existing.sidebar as Record<string, unknown> | undefined) ?? {};
  const pageContent: Record<string, unknown> = {
    ...existing,
    sidebar: {
      ...existingSidebar,
      tiers: form.sidebarTiers ?? existingSidebar.tiers ?? [],
    },
    tags:
      form.tags
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [],
    treatment: {
      act1: form.treatment ?? '',
      act2: '',
    },
    tabbedSection: {
      ...tabbedSection,
      synopsis: {
        ...synopsis,
        storySynopsis: form.storySynopsis ?? '',
        whyMatters: form.whyMatters ?? '',
      },
      castingVote:
        form.castingVote ??
        castingVoteExisting ?? {
          title: 'Vote for Your Dream Cast',
          subtitle: '',
          cast: [],
          tip: '',
        },
      production: {
        title:
          form.productionTitle ??
          productionExisting?.title ??
          'Production Timeline',
        stages: form.productionStages ?? productionExisting?.stages ?? [],
      },
      updates: {
        items: form.updatesItems ?? updatesExisting?.items ?? [],
      },
    },
    sampleScenes: {
      title:
        form.sampleScenes?.title ??
        sampleScenesExisting?.title ??
        'Sample Scenes',
      unlockMessage:
        form.sampleScenes?.unlockMessage ??
        sampleScenesExisting?.unlockMessage ??
        '',
      pledgeAmount: 0,
      description:
        form.sampleScenes?.description ??
        sampleScenesExisting?.description ??
        '',
      pages: (form.sampleScenes?.pages ?? sampleScenesExisting?.pages ?? []).map((p, i) => ({
        id: p.id ?? `page-${i + 1}`,
        title: p.title ?? `Scene ${i + 1}`,
        content: p.content ?? '',
      })),
      unlockedPageCount:
        form.sampleScenes?.unlockedPageCount ??
        sampleScenesExisting?.unlockedPageCount ??
        0,
      lockedPageCount:
        form.sampleScenes?.lockedPageCount ?? sampleScenesExisting?.lockedPageCount ?? 0,
      creditsPerPage: form.sampleScenes?.creditsPerPage ?? sampleScenesExisting?.creditsPerPage ?? 1,
    },
    screenplayScore: form.screenplayScore ?? (existing.screenplayScore as ScreenplayScoreForm),
    aiAnalysis: form.aiAnalysis ?? (existing.aiAnalysis as AiAnalysisForm),
    similarFilms: form.similarFilms ?? (existing.similarFilms as SimilarFilmForm[]) ?? [],
    pledgeVoting: form.pledgeVoting
      ? {
          title: form.pledgeVoting.title,
          subtitle: form.pledgeVoting.subtitle,
          pledgeAmount: 0,
          categories: form.pledgeVoting.categories.map((c) => ({
            id: c.id,
            label: c.label,
            icon: c.icon,
            labelLeft: c.labelLeft,
            labelRight: c.labelRight,
          })),
        }
      : (pledgeVotingExisting ?? defaultPledge),
    mainCharacters: form.mainCharacters ?? [],
    keyCrew: form.keyCrew ?? (existing.keyCrew as KeyCrewMemberForm[]) ?? [],
    keyCrewVisible: form.keyCrewVisible ?? (existing.keyCrewVisible as boolean) ?? false,
  };

  return {
    title: form.title,
    logline: form.logline,
    synopsis: form.synopsis,
    directorName: form.directorName,
    genre: form.genre,
    goalAmount: form.goalAmount,
    deadline: form.deadline || undefined,
    posterUrl: form.posterUrl,
    trendingText: form.trendingText,
    cachedVotesCount: form.cachedVotesCount,
    cachedAverageScore: form.cachedAverageScore,
    pageContent,
    pagePublished: form.pagePublished,
  };
}
