import { fetchApi, getApiUrl } from './api';
import type { ProfileData, VerificationData, VerificationDocument } from '@/markup/profile';

type ApiVerificationDoc = {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'uploaded' | 'approved' | 'rejected';
  adminComment?: string;
  url?: string;
};

type ApiVerification = {
  status: string;
  adminFeedback?: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  documents: ApiVerificationDoc[];
};

type ApiProfile = {
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string;
  emailVerifiedAt: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  website: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  avatarUrl: string | null;
  memberSince: string;
  role: string;
  identityLocked?: boolean;
  filmmaker?: {
    productionCompany: string | null;
    imdbUrl: string | null;
    filmmakerStatement: string | null;
    yearsOfExperience: string;
    specialization: string[];
  };
  verification: ApiVerification;
};

function mapVerificationDoc(doc: ApiVerificationDoc): VerificationDocument {
  return {
    id: doc.id,
    type: doc.type as VerificationDocument['type'],
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    uploadedAt: doc.uploadedAt,
    status: doc.status,
    adminComment: doc.adminComment,
  };
}

function mapVerification(v: ApiVerification): VerificationData {
  return {
    status: v.status as VerificationData['status'],
    adminFeedback: v.adminFeedback,
    submittedAt: v.submittedAt ?? undefined,
    reviewedAt: v.reviewedAt ?? undefined,
    documents: v.documents.map(mapVerificationDoc),
  };
}

function mapProfile(api: ApiProfile): ProfileData {
  return {
    firstName: api.firstName ?? '',
    lastName: api.lastName ?? '',
    displayName: api.displayName ?? '',
    email: api.email,
    emailVerifiedAt: api.emailVerifiedAt ?? null,
    phone: api.phone ?? '',
    dateOfBirth: api.dateOfBirth ?? '',
    country: api.country ?? '',
    city: api.city ?? '',
    bio: api.bio ?? '',
    website: api.website ?? '',
    socialTwitter: api.socialTwitter ?? '',
    socialInstagram: api.socialInstagram ?? '',
    socialLinkedin: api.socialLinkedin ?? '',
    avatarUrl: api.avatarUrl,
    memberSince: api.memberSince,
    role: api.role as ProfileData['role'],
    identityLocked: api.identityLocked ?? false,
    verification: mapVerification(api.verification),
    filmmaker: api.filmmaker
      ? {
          productionCompany: api.filmmaker.productionCompany ?? '',
          imdbUrl: api.filmmaker.imdbUrl ?? '',
          filmmakerStatement: api.filmmaker.filmmakerStatement ?? '',
          yearsOfExperience: api.filmmaker.yearsOfExperience ?? '',
          specialization: api.filmmaker.specialization ?? [],
        }
      : undefined,
  };
}

export async function getProfile(accessToken: string | undefined): Promise<ProfileData> {
  const data = await fetchApi<{ profile: ApiProfile }>('users/me', accessToken);
  return mapProfile(data.profile);
}

export async function updateProfile(
  accessToken: string | undefined,
  body: Record<string, unknown>,
): Promise<ProfileData> {
  const data = await fetchApi<{ profile: ApiProfile }>('users/me', accessToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return mapProfile(data.profile);
}

export async function uploadAvatar(
  accessToken: string | undefined,
  file: File,
): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return fetchApi<{ avatarUrl: string }>('users/me/avatar', accessToken, {
    method: 'POST',
    body: formData,
  });
}

export async function getVerification(
  accessToken: string | undefined,
): Promise<VerificationData> {
  const data = await fetchApi<{ verification: ApiVerification }>(
    'users/me/verification',
    accessToken,
  );
  return mapVerification(data.verification);
}

export async function uploadVerificationDoc(
  accessToken: string | undefined,
  type: string,
  file: File,
): Promise<VerificationDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const data = await fetchApi<{ document: ApiVerificationDoc }>(
    'users/me/verification/documents',
    accessToken,
    { method: 'POST', body: formData },
  );
  return mapVerificationDoc(data.document);
}

export async function deleteVerificationDoc(
  accessToken: string | undefined,
  documentId: string,
): Promise<void> {
  await fetchApi<{ ok: true }>(
    `users/me/verification/documents/${documentId}`,
    accessToken,
    { method: 'DELETE' },
  );
}

export async function submitVerification(
  accessToken: string | undefined,
): Promise<VerificationData> {
  const data = await fetchApi<{ verification: ApiVerification }>(
    'users/me/verification/submit',
    accessToken,
    { method: 'POST' },
  );
  return mapVerification(data.verification);
}

export async function resendVerificationEmail(
  accessToken: string | undefined,
): Promise<{ ok: boolean }> {
  return fetchApi<{ ok: boolean }>('auth/resend-verification', accessToken, {
    method: 'POST',
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>('auth/forgot-password', undefined, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ ok: boolean }> {
  return fetchApi<{ ok: boolean }>('auth/reset-password', undefined, {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function requestChangeEmail(
  accessToken: string | undefined,
  newEmail: string,
): Promise<{ message: string }> {
  return fetchApi<{ message: string }>('auth/request-change-email', accessToken, {
    method: 'POST',
    body: JSON.stringify({ newEmail }),
  });
}

export async function confirmEmailChange(token: string): Promise<{ ok: boolean }> {
  const url = getApiUrl(`auth/confirm-email-change?token=${encodeURIComponent(token)}`);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<{ ok: boolean }>;
}
