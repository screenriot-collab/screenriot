export const CAST_TIER_VALUES = [
  'lead_protagonist',
  'second_lead_protagonist',
  'lead_antagonist',
  'supporting',
  'co_lead',
  'background',
] as const;
export type CastTier = (typeof CAST_TIER_VALUES)[number];

const TIER_LABELS: Record<CastTier, string> = {
  lead_protagonist: 'Lead Protagonist',
  second_lead_protagonist: 'Second Lead Protagonist',
  lead_antagonist: 'Lead Antagonist',
  supporting: 'Supporting Role',
  co_lead: 'Co-Lead',
  background: 'Background Actor',
};

export type WishListCastStatus = 'wish_list' | 'verified';

type Step3CastRow = {
  actorName?: string;
  actorEmail?: string;
  character?: string;
  role?: string;
  tier?: string;
  characterDescription?: string;
};

type WishListRow = {
  actorName?: string;
  character?: string;
  role?: string;
  tier?: string;
  characterDescription?: string;
  status?: string;
};

export type Step3Shape = {
  cast?: Step3CastRow[];
  crew?: unknown[];
  wishListCast?: unknown;
};

function isCastTier(value: string): value is CastTier {
  return (CAST_TIER_VALUES as readonly string[]).includes(value);
}

function characterFromRow(row: { character?: string; role?: string }): string {
  return (row.character ?? row.role ?? '').trim();
}

function tierLabel(tier: string): string {
  return isCastTier(tier) ? TIER_LABELS[tier] : tier;
}

function roleLine(character: string, tier: string): string {
  const tierText = tierLabel(tier || 'lead_protagonist');
  if (character && tierText) return `${character} · ${tierText}`;
  return character || tierText || '—';
}

export function step3CastToMainCharacters(step3: Step3Shape | null): {
  id: string;
  name: string;
  role: string;
  character: string;
  tier: CastTier;
  description: string;
  imageUrl: null;
}[] {
  const cast = step3?.cast ?? [];
  return cast
    .filter(
      (row) =>
        (row.actorName ?? '').trim() ||
        (row.actorEmail ?? '').trim() ||
        characterFromRow(row),
    )
    .map((row, i) => {
      const actorName = (row.actorName ?? '').trim();
      const actorEmail = (row.actorEmail ?? '').trim();
      const character = characterFromRow(row);
      const tier = isCastTier((row.tier ?? '').trim())
        ? (row.tier as CastTier)
        : 'lead_protagonist';
      const name = actorName || (/@/.test(actorEmail) ? '—' : actorEmail || '—');
      return {
        id: `cast-${i}`,
        name,
        role: roleLine(character, tier),
        character,
        tier,
        description: (row.characterDescription ?? '').trim(),
        imageUrl: null,
      };
    });
}

function normalizeWishListRows(raw: unknown): WishListRow[] {
  if (Array.isArray(raw)) return raw as WishListRow[];
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ actorName: name }));
  }
  return [];
}

export function wishListToCastingVoteOptions(wishListRaw: unknown): {
  id: string;
  name: string;
  role: string;
  character: string;
  tier: string;
  characterDescription: string;
  status: WishListCastStatus;
  votePercent: number;
  votes: number;
}[] {
  return normalizeWishListRows(wishListRaw)
    .filter((row) => (row.actorName ?? '').trim())
    .map((row, index) => {
      const character = characterFromRow(row);
      const tier = isCastTier((row.tier ?? '').trim()) ? row.tier! : 'lead_protagonist';
      const status: WishListCastStatus =
        row.status === 'verified' ? 'verified' : 'wish_list';
      return {
        id: `wish-${index}`,
        name: (row.actorName ?? '').trim(),
        role: roleLine(character, tier),
        character,
        tier,
        characterDescription: (row.characterDescription ?? '').trim(),
        status,
        votePercent: 0,
        votes: 0,
      };
    });
}

/** Only wish-list rows are fan-votable; verified/signed cast are excluded from voting UI. */
export function votableCastingOptions(
  options: { id?: string | null; status?: string | null }[],
): { id?: string | null; status?: string | null }[] {
  return options.filter((o) => (o.status ?? 'wish_list') !== 'verified');
}
