export const CAST_TIER_VALUES = [
  'lead_protagonist',
  'second_lead_protagonist',
  'lead_antagonist',
  'supporting',
  'co_lead',
  'background',
] as const;

export type CastTier = (typeof CAST_TIER_VALUES)[number];

export const CAST_TIER_LABELS: Record<CastTier, string> = {
  lead_protagonist: 'Lead Protagonist',
  second_lead_protagonist: 'Second Lead Protagonist',
  lead_antagonist: 'Lead Antagonist',
  supporting: 'Supporting Role',
  co_lead: 'Co-Lead',
  background: 'Background Actor',
};

export type WishListCastStatus = 'wish_list' | 'verified';

export type KeyCastMember = {
  actorName: string;
  character: string;
  tier: CastTier;
  actorEmail: string;
  characterDescription: string;
};

export type WishListCastMember = {
  actorName: string;
  character: string;
  tier: CastTier;
  characterDescription: string;
  status: WishListCastStatus;
};

export function emptyKeyCastMember(): KeyCastMember {
  return {
    actorName: '',
    character: '',
    tier: 'lead_protagonist',
    actorEmail: '',
    characterDescription: '',
  };
}

export function emptyWishListCastMember(): WishListCastMember {
  return {
    actorName: '',
    character: '',
    tier: 'lead_protagonist',
    characterDescription: '',
    status: 'wish_list',
  };
}

export function isCastTier(value: string): value is CastTier {
  return (CAST_TIER_VALUES as readonly string[]).includes(value);
}

export function formatTierLabel(tier: string): string {
  if (isCastTier(tier)) return CAST_TIER_LABELS[tier];
  return tier;
}

export function formatCastRoleLine(character: string, tier: string): string {
  const char = character.trim();
  const tierLabel = formatTierLabel(tier);
  if (char && tierLabel) return `${char} · ${tierLabel}`;
  return char || tierLabel || '—';
}

function legacyRoleToCharacter(row: {
  character?: string;
  role?: string;
}): string {
  return (row.character ?? row.role ?? '').trim();
}

export function normalizeKeyCastMember(raw: Record<string, unknown>): KeyCastMember {
  const tierRaw = String(raw.tier ?? 'lead_protagonist');
  return {
    actorName: String(raw.actorName ?? '').trim(),
    character: legacyRoleToCharacter(raw as { character?: string; role?: string }),
    tier: isCastTier(tierRaw) ? tierRaw : 'lead_protagonist',
    actorEmail: String(raw.actorEmail ?? '').trim(),
    characterDescription: String(raw.characterDescription ?? '').trim(),
  };
}

export function normalizeWishListCast(raw: unknown): WishListCastMember[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const tierRaw = String(row.tier ?? 'lead_protagonist');
      const statusRaw = String(row.status ?? 'wish_list');
      return {
        actorName: String(row.actorName ?? '').trim(),
        character: legacyRoleToCharacter(row as { character?: string; role?: string }),
        tier: isCastTier(tierRaw) ? tierRaw : 'lead_protagonist',
        characterDescription: String(row.characterDescription ?? '').trim(),
        status: statusRaw === 'verified' ? 'verified' : 'wish_list',
      };
    });
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({
        ...emptyWishListCastMember(),
        actorName: name,
      }));
  }
  return [];
}

export function wishListToCastingVoteOptions(
  members: WishListCastMember[],
): {
  id: string;
  name: string;
  role: string;
  character: string;
  tier: CastTier;
  characterDescription: string;
  status: WishListCastStatus;
  votePercent: number;
  votes: number;
}[] {
  return members
    .filter((m) => (m.actorName ?? '').trim())
    .map((m, index) => ({
      id: `wish-${index}`,
      name: m.actorName.trim(),
      role: formatCastRoleLine(m.character, m.tier),
      character: m.character.trim(),
      tier: m.tier,
      characterDescription: m.characterDescription.trim(),
      status: m.status,
      votePercent: 0,
      votes: 0,
    }));
}
