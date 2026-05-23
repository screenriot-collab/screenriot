import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ProfileView } from '@/components/ProfileView';
import { getProfile } from '@/lib/profile-api';
import {
  MOCK_VERIFICATION_NOT_STARTED,
  type ProfileData,
  type UserRole,
} from '@/markup/profile';

/** Minimal profile when API is unavailable: only session-derived fields, rest empty. */
function emptyProfileFromSession(role: UserRole, email: string, displayName: string): ProfileData {
  return {
    firstName: '',
    lastName: '',
    displayName: displayName || '',
    email: email || '',
    emailVerifiedAt: null,
    phone: '',
    dateOfBirth: '',
    country: '',
    city: '',
    bio: '',
    website: '',
    socialTwitter: '',
    socialInstagram: '',
    socialLinkedin: '',
    avatarUrl: null,
    memberSince: new Date().toISOString(),
    role,
    identityLocked: false,
    verification: MOCK_VERIFICATION_NOT_STARTED,
    ...(role === 'filmmaker' && {
      filmmaker: {
        productionCompany: '',
        imdbUrl: '',
        filmmakerStatement: '',
        yearsOfExperience: '',
        specialization: [],
      },
    }),
  };
}

type PageProps = { searchParams: Promise<{ tab?: string }> };

export default async function ProfilePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/profile');
  }

  const params = await searchParams;
  const initialTab = params.tab === 'security' ? 'security' : undefined;

  let profileData: ProfileData;

  try {
    profileData = await getProfile(session.accessToken);
  } catch {
    // API unavailable: show empty profile with only session data (no mock content)
    const role = (session.user?.role as UserRole) ?? 'fan';
    const email = (session.user?.email as string) ?? '';
    const name = (session.user?.name as string) ?? '';
    profileData = emptyProfileFromSession(role, email, name);
  }

  return (
    <Suspense
      fallback={
        <div className="text-sm text-screenriot-muted" role="status">
          Loading profile…
        </div>
      }
    >
      <ProfileView profileData={profileData} initialTab={initialTab} />
    </Suspense>
  );
}
