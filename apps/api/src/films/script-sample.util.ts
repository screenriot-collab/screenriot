export type ScriptPageStored = {
  id?: string;
  title?: string;
  content?: string;
};

export type ScriptPagePublic = {
  id: string;
  title: string;
  locked: boolean;
  content?: string;
};

export type ScriptSampleConfig = {
  title: string;
  unlockMessage: string;
  freePreviewCount: number;
  creditsPerPage: number;
  pages: ScriptPageStored[];
};

export type PublicScriptSample = {
  title: string;
  emptyMessage: string;
  freePreviewCount: number;
  creditsPerPage: number;
  totalPages: number;
  pages: ScriptPagePublic[];
  scriptCredits?: number;
};

const DEFAULT_CREDITS_PER_PAGE = 1;

export function parseScriptSampleConfig(raw: unknown): ScriptSampleConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const pagesRaw = Array.isArray(row.pages) ? row.pages : [];
  const pages: ScriptPageStored[] = pagesRaw
    .map((p, index) => {
      const page = p as Record<string, unknown>;
      const content = typeof page.content === 'string' ? page.content.trim() : '';
      const title =
        typeof page.title === 'string' && page.title.trim()
          ? page.title.trim()
          : `Scene ${index + 1}`;
      const id =
        typeof page.id === 'string' && page.id.trim()
          ? page.id.trim()
          : `page-${index + 1}`;
      if (!content) return null;
      return { id, title, content };
    })
    .filter((p): p is ScriptPageStored & { id: string; title: string; content: string } => p !== null);

  if (pages.length === 0) {
    const legacy = typeof row.description === 'string' ? row.description.trim() : '';
    if (!legacy) return null;
    pages.push({ id: 'page-1', title: 'Scene 1', content: legacy });
  }

  const freePreviewCount =
    typeof row.unlockedPageCount === 'number' && row.unlockedPageCount >= 0
      ? Math.min(row.unlockedPageCount, pages.length)
      : typeof row.freePreviewCount === 'number' && row.freePreviewCount >= 0
        ? Math.min(row.freePreviewCount, pages.length)
        : Math.min(1, pages.length);

  const creditsPerPage =
    typeof row.creditsPerPage === 'number' && row.creditsPerPage > 0
      ? Math.round(row.creditsPerPage)
      : DEFAULT_CREDITS_PER_PAGE;

  const title =
    typeof row.title === 'string' && row.title.trim() ? row.title.trim() : 'Script Sample';
  const unlockMessage =
    typeof row.unlockMessage === 'string' && row.unlockMessage.trim()
      ? row.unlockMessage.trim()
      : 'Sample scenes will be published when the filmmaker adds them.';

  return { title, unlockMessage, freePreviewCount, creditsPerPage, pages };
}

export function buildPublicScriptSample(
  raw: unknown,
  unlockedPageIds: Set<string>,
  scriptCredits?: number,
): PublicScriptSample | null {
  const config = parseScriptSampleConfig(raw);
  if (!config) return null;

  const pages: ScriptPagePublic[] = config.pages.map((page, index) => {
    const id = page.id ?? `page-${index + 1}`;
    const title = page.title ?? `Scene ${index + 1}`;
    const isFree = index < config.freePreviewCount;
    const isUnlocked = isFree || unlockedPageIds.has(id);

    if (isUnlocked) {
      return {
        id,
        title,
        locked: false,
        content: page.content ?? '',
      };
    }

    return {
      id,
      title: `Scene ${index + 1}: [Locked]`,
      locked: true,
    };
  });

  return {
    title: config.title,
    emptyMessage: config.unlockMessage,
    freePreviewCount: config.freePreviewCount,
    creditsPerPage: config.creditsPerPage,
    totalPages: pages.length,
    pages,
    ...(scriptCredits != null ? { scriptCredits } : {}),
  };
}

export function getScriptPageContent(
  raw: unknown,
  pageId: string,
): { id: string; title: string; content: string } | null {
  const config = parseScriptSampleConfig(raw);
  if (!config) return null;
  const index = config.pages.findIndex((p, i) => (p.id ?? `page-${i + 1}`) === pageId);
  if (index < 0) return null;
  const page = config.pages[index];
  const id = page.id ?? `page-${index + 1}`;
  return {
    id,
    title: page.title ?? `Scene ${index + 1}`,
    content: page.content ?? '',
  };
}

export function isScriptPageUnlockable(
  raw: unknown,
  pageId: string,
  unlockedPageIds: Set<string>,
): boolean {
  return getScriptUnlockBlockReason(raw, pageId, unlockedPageIds) === null;
}

export function getScriptUnlockBlockReason(
  raw: unknown,
  pageId: string,
  unlockedPageIds: Set<string>,
): string | null {
  const config = parseScriptSampleConfig(raw);
  if (!config) {
    return 'This screenplay sample is not configured yet.';
  }
  const index = config.pages.findIndex((p, i) => (p.id ?? `page-${i + 1}`) === pageId);
  if (index < 0) {
    return 'Script page not found. Refresh the page and try again.';
  }
  if (index < config.freePreviewCount) {
    return 'This page is already free to read — no credits needed.';
  }
  if (unlockedPageIds.has(pageId)) {
    return 'You have already unlocked this page. Refresh the page to view it.';
  }
  return null;
}

export function countLockedPagesRemaining(
  raw: unknown,
  unlockedPageIds: Set<string>,
): number {
  const config = parseScriptSampleConfig(raw);
  if (!config) return 0;
  return config.pages.filter((page, index) => {
    const id = page.id ?? `page-${index + 1}`;
    if (index < config.freePreviewCount) return false;
    return !unlockedPageIds.has(id);
  }).length;
}
