export type ContributionPatch = {
  path: string;
  label: string;
  oldValue: string;
  newValue: string;
};

const FIELD_LABELS: Record<string, string> = {
  title: 'Title',
  logline: 'Logline',
  synopsis: 'Hero synopsis',
  genre: 'Genre',
  directorName: 'Director name',
};

function formatDisplayValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function humanizePath(path: string): string {
  if (FIELD_LABELS[path]) return FIELD_LABELS[path];
  const mc = /^pageContent\.mainCharacters\.[^.]+\.(.+)$/.exec(path);
  if (mc) {
    const field = mc[1] === 'description' ? 'Description' : mc[1];
    return `Character — ${field}`;
  }
  if (path === 'pageContent.treatment.act1') return 'Treatment (Act 1)';
  if (path === 'pageContent.tabbedSection.synopsis.storySynopsis') return 'Story synopsis';
  if (path === 'pageContent.tabbedSection.synopsis.whyMatters') return 'Why this film matters';
  return path
    .replace(/^pageContent\./, '')
    .replace(/\./g, ' → ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
}

function normalizeSinglePatch(raw: unknown): ContributionPatch | null {
  if (!raw || typeof raw !== 'object') return null;
  const patch = raw as Record<string, unknown>;
  const path = String(patch.path ?? '').trim();
  const label = String(patch.label ?? '').trim() || humanizePath(path) || 'Field';
  return {
    path,
    label,
    oldValue: formatDisplayValue(patch.oldValue),
    newValue: formatDisplayValue(patch.newValue),
  };
}

function extractPatchesArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    return Object.values(raw as Record<string, unknown>);
  }
  return [];
}

export function normalizeContributionPatches(changes: unknown): ContributionPatch[] {
  if (!changes || typeof changes !== 'object') {
    return [];
  }

  if (Array.isArray(changes)) {
    return changes
      .map(normalizeSinglePatch)
      .filter((p): p is ContributionPatch => p !== null);
  }

  const record = changes as Record<string, unknown>;

  if (record.patches != null) {
    const list = extractPatchesArray(record.patches);
    const patches = list
      .map(normalizeSinglePatch)
      .filter((p): p is ContributionPatch => p !== null);
    if (patches.length > 0) {
      return patches;
    }
  }

  return Object.entries(record)
    .filter(([key]) => key !== 'patches')
    .map(([key, val]) => ({
      path: key,
      label: humanizePath(key),
      oldValue: '',
      newValue: formatDisplayValue(val),
    }))
    .filter((p) => p.newValue);
}
