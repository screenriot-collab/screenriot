import {
  EDITABLE_PAGE_STATUSES,
  DEFAULT_PLEDGE_VOTING_CATEGORIES,
} from '@/constants/films';
import type {
  AdminFilmDetail,
  FilmPageFormState,
  FilmPageUpdate,
  MainCharacterForm,
  CastingVoteForm,
  CastingVoteOptionForm,
  ProductionForm,
  ProductionStageForm,
  UpdateItemForm,
  SampleScenesForm,
  PledgeVotingForm,
  PledgeVotingCategoryForm,
  InvestmentTierForm,
} from '@/types/films';

export function canEditPage(status: string): boolean {
  return EDITABLE_PAGE_STATUSES.includes(status);
}

export function parseWishListCastToOptions(
  wishListCast: string | undefined | null,
): CastingVoteOptionForm[] {
  if (!wishListCast) return [];
  const items = wishListCast
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return items.map((name, index) => ({
    id: `wish-${index}`,
    name,
    role: '',
    votePercent: 0,
    votes: 0,
  }));
}

type Step3CastRow = { actorName?: string; actorEmail?: string; role?: string };

function mainCharactersFromDetail(
  pcMain: MainCharacterForm[] | undefined,
  step3Cast: Step3CastRow[],
): MainCharacterForm[] {
  if (pcMain && pcMain.length > 0) {
    return pcMain.map((c) => ({
      id: c.id ?? `cast-${Math.random().toString(36).slice(2, 9)}`,
      name: c.name ?? '',
      role: c.role ?? '',
      description: c.description ?? '',
      imageUrl: c.imageUrl ?? null,
      actorEmail: c.actorEmail ?? undefined,
    }));
  }
  return step3Cast.map((row: Step3CastRow, i: number) => {
    const actorName = (row.actorName ?? '').trim();
    const actorEmail = (row.actorEmail ?? '').trim();
    const role = (row.role ?? '').trim();
    const emailHasAt = /@/.test(actorEmail);
    const roleLooksLikeName = role && !/@/.test(role);
    const name =
      actorName ||
      (emailHasAt ? (roleLooksLikeName ? role : '—') : actorEmail) ||
      '—';
    const roleVal = emailHasAt && roleLooksLikeName ? '—' : role || '—';
    return {
      id: `cast-${i}`,
      name,
      role: roleVal,
      description: '',
      imageUrl: null,
      actorEmail: actorEmail || undefined,
    };
  });
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
      (row.role ?? '').trim(),
  );
  const mainCharacters = mainCharactersFromDetail(pcMain, step3Cast);

  const existingCasting = tabSection?.castingVote as CastingVoteForm | undefined;
  const wishListCast = (f.step3?.wishListCast ?? '').trim();
  const castingFromWishList = parseWishListCastToOptions(wishListCast);
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
  const sampleScenes: SampleScenesForm = existingSampleScenes
    ? {
        title: existingSampleScenes.title ?? 'Sample Scenes',
        unlockMessage: existingSampleScenes.unlockMessage ?? '',
        pledgeAmount:
          typeof existingSampleScenes.pledgeAmount === 'number'
            ? existingSampleScenes.pledgeAmount
            : 50,
        description: existingSampleScenes.description ?? '',
      }
    : {
        title: 'Sample Scenes',
        unlockMessage:
          'Unlock sample scenes to get a deeper understanding of the script quality and dialogue.',
        pledgeAmount: 50,
        description: '',
      };

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
          title: existingPledge.title ?? 'Pledge-Based Voting',
          subtitle: existingPledge.subtitle ?? '',
          pledgeAmount:
            typeof existingPledge.pledgeAmount === 'number'
              ? existingPledge.pledgeAmount
              : 25,
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
          title: 'Pledge-Based Voting',
          subtitle:
            '$25 pledge per category • Held in escrow • Converts to investment if your choice wins',
          pledgeAmount: 25,
          categories: DEFAULT_PLEDGE_VOTING_CATEGORIES.map((c) => ({ ...c })),
        };

  return {
    slug: f.slug ?? '',
    title: f.title ?? '',
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
    castingVote,
    productionTitle,
    productionStages,
    updatesItems,
    sampleScenes,
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
    title: 'Pledge-Based Voting',
    subtitle: '',
    pledgeAmount: 25,
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
      pledgeAmount:
        form.sampleScenes?.pledgeAmount ??
        sampleScenesExisting?.pledgeAmount ??
        50,
      description:
        form.sampleScenes?.description ??
        sampleScenesExisting?.description ??
        '',
    },
    pledgeVoting: form.pledgeVoting
      ? {
          title: form.pledgeVoting.title,
          subtitle: form.pledgeVoting.subtitle,
          pledgeAmount: form.pledgeVoting.pledgeAmount,
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
  };

  return {
    title: form.title,
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
