export const USERS_PAGE_SIZE = 20;

export const USER_TABS: { id: string; label: string; role?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'fan', label: 'Fans', role: 'fan' },
  { id: 'filmmaker', label: 'Filmmakers', role: 'filmmaker' },
];

export const VERIFICATION_TABS: { id: string; label: string; status?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'not_started', label: 'Not Verified', status: 'not_started' },
  { id: 'pending', label: 'Pending', status: 'pending' },
  { id: 'verified', label: 'Verified', status: 'verified' },
  { id: 'rejected', label: 'Rejected', status: 'rejected' },
];

export const VERIFICATION_STATUS_LABEL: Record<string, string> = {
  not_started: 'Not Verified',
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

export const DOC_TYPE_LABEL: Record<string, string> = {
  government_id: 'Government ID',
  proof_of_address: 'Proof of Address',
  selfie_with_id: 'Selfie with ID',
  business_registration: 'Business Registration',
  guild_membership: 'Guild Membership',
  festival_certificate: 'Festival Certificate',
  credits_documentation: 'Credits Documentation',
};
