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
