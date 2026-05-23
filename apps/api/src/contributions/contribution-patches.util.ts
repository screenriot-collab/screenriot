export type ContributionPatch = {
  path: string;
  label: string;
  oldValue: string;
  newValue: string;
};

export type ContributionChangesPayload = {
  patches: ContributionPatch[];
};

function formatPatchValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
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
      .filter((p): p is ContributionPatch => {
        if (!p || typeof p !== 'object') return false;
        const patch = p as ContributionPatch;
        return typeof patch.path === 'string' && typeof patch.newValue === 'string';
      })
      .map((p) => ({
        path: p.path,
        label: typeof p.label === 'string' ? p.label : p.path,
        oldValue: formatPatchValue(p.oldValue),
        newValue: p.newValue,
      }));
  }

  const record = changes as Record<string, unknown>;
  if (record.patches != null) {
    const list = extractPatchesArray(record.patches);
    const patches = list
      .filter((p): p is ContributionPatch => {
        if (!p || typeof p !== 'object') return false;
        const patch = p as ContributionPatch;
        return typeof patch.path === 'string' && typeof patch.newValue === 'string';
      })
      .map((p) => ({
        path: p.path,
        label: typeof p.label === 'string' ? p.label : p.path,
        oldValue: formatPatchValue(p.oldValue),
        newValue: p.newValue,
      }));
    if (patches.length > 0) {
      return patches;
    }
  }

  return Object.entries(record)
    .filter(([key]) => key !== 'patches')
    .map(([key, val]) => ({
      path: key,
      label: key,
      oldValue: '',
      newValue: formatPatchValue(val),
    }))
    .filter((p) => p.newValue);
}

function setNestedValue(
  root: Record<string, unknown>,
  pathParts: string[],
  value: string,
): void {
  let current: Record<string, unknown> = root;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i];
    const next = current[key];
    if (!next || typeof next !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[pathParts[pathParts.length - 1]] = value;
}

function applyMainCharacterField(
  pageContent: Record<string, unknown>,
  characterId: string,
  field: string,
  value: string,
): void {
  const raw = pageContent.mainCharacters;
  if (!Array.isArray(raw)) return;
  const mainCharacters = raw.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const row = item as Record<string, unknown>;
    if (row.id !== characterId) return item;
    return { ...row, [field]: value };
  });
  pageContent.mainCharacters = mainCharacters;
}

/**
 * Applies filmmaker patches to Film columns and pageContent JSON.
 */
export function applyContributionPatches(
  film: {
    title: string;
    synopsis: string | null;
    logline: string | null;
    genre: string | null;
    directorName: string | null;
    pageContent: unknown;
  },
  changes: unknown,
): {
  filmColumns: Partial<{
    title: string;
    synopsis: string | null;
    logline: string | null;
    genre: string | null;
    directorName: string | null;
  }>;
  pageContent: Record<string, unknown>;
} {
  const patches = normalizeContributionPatches(changes);
  const pageContent = {
    ...((film.pageContent as Record<string, unknown>) ?? {}),
  };
  const filmColumns: Record<string, string | null> = {};

  const filmFieldKeys = new Set([
    'title',
    'synopsis',
    'logline',
    'genre',
    'directorName',
  ]);

  for (const patch of patches) {
    const mcMatch = /^pageContent\.mainCharacters\.([^.]+)\.(\w+)$/.exec(patch.path);
    if (mcMatch) {
      applyMainCharacterField(pageContent, mcMatch[1], mcMatch[2], patch.newValue);
      continue;
    }

    if (patch.path.startsWith('pageContent.')) {
      const innerPath = patch.path.slice('pageContent.'.length);
      const parts = innerPath.split('.');
      setNestedValue(pageContent, parts, patch.newValue);
      continue;
    }

    if (filmFieldKeys.has(patch.path)) {
      filmColumns[patch.path] = patch.newValue.trim() || null;
    }
  }

  return { filmColumns, pageContent };
}
