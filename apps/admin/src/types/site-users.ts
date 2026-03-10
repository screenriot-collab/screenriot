export type AdminRef = {
  id: string;
  username: string | null;
};

export type SiteUser = {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  verificationId: string | null;
  verificationStatus: string;
  lastActionAt: string | null;
  lastActionBy: AdminRef | null;
};

export type SiteUsersListResponse = {
  users: SiteUser[];
  total: number;
  page: number;
  limit: number;
};

export type VerificationDocument = {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'uploaded' | 'approved' | 'rejected';
  adminComment: string | null;
  url: string;
};

export type SiteUserDetail = {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  lastEditedBy: AdminRef | null;
  filmmaker: {
    productionCompany: string | null;
    imdbUrl: string | null;
    statement: string | null;
    yearsOfExperience: number | null;
    specialization: string[];
  } | null;
  verification: {
    id: string;
    status: string;
    adminFeedback: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewedBy: AdminRef | null;
    documents: VerificationDocument[];
  } | null;
};
