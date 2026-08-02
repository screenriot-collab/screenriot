export const PAGE_SIZE = 20;

export const STATUS_TABS: { id: string; label: string; status?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending', status: 'pending_approval' },
  { id: 'approved', label: 'Approved', status: 'approved' },
  { id: 'rejected', label: 'Rejected', status: 'rejected' },
  { id: 'draft', label: 'Drafts', status: 'draft' },
];

export const ADMIN_ROLES = ['super_admin', 'admin'];

/** Film statuses that allow editing the public film page in admin. */
export const EDITABLE_PAGE_STATUSES = ['approved', 'fundraising', 'funded', 'closed'];

/** Cast tier/role type. Kept in sync with apps/web/src/lib/cast-members.ts CAST_TIER_VALUES. */
export const CAST_TIER_OPTIONS: { value: string; label: string }[] = [
  { value: 'lead_protagonist', label: 'Lead Protagonist' },
  { value: 'second_lead_protagonist', label: 'Second Lead Protagonist' },
  { value: 'lead_antagonist', label: 'Lead Antagonist' },
  { value: 'supporting', label: 'Supporting Role' },
  { value: 'co_lead', label: 'Co-Lead' },
  { value: 'background', label: 'Background Actor' },
];

export const CAST_TIER_LABELS: Record<string, string> = Object.fromEntries(
  CAST_TIER_OPTIONS.map((o) => [o.value, o.label]),
);

export const PRODUCTION_STATUS_OPTIONS: { value: 'planned' | 'upcoming' | 'in_progress' | 'completed'; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const DEFAULT_PLEDGE_VOTING_CATEGORIES: { id: string; label: string; icon: 'story' | 'script' | 'casting'; labelLeft: string; labelRight: string }[] = [
  { id: 'story', label: 'Story Uniqueness', icon: 'story', labelLeft: 'Not Unique', labelRight: 'Highly Original' },
  { id: 'script', label: 'Script Brilliance', icon: 'script', labelLeft: 'Needs Work', labelRight: 'Exceptional' },
  { id: 'casting', label: 'Casting Appeal', icon: 'casting', labelLeft: 'Weak', labelRight: 'Perfect Cast' },
];
