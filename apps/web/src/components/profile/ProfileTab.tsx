'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { IMAGES } from '@/lib/constants';
import {
  FILMMAKER_SPECIALIZATIONS,
  PROFILE_COUNTRIES,
  PLACEHOLDER_BADGES,
  type ProfileData,
  type VerificationStatus,
} from '@/markup/profile';
import { updateProfile, uploadAvatar, getProfile, resendVerificationEmail } from '@/lib/profile-api';

const INPUT_CLASS =
  'mt-1 w-full rounded border border-white/20 bg-screenriot-bg px-3 py-2 text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue';

const LABEL_CLASS = 'block text-sm font-medium text-white';

const BIO_MAX = 500;
const STATEMENT_MAX = 1000;

interface ProfileTabProps {
  initialProfile: ProfileData;
}

const AVATAR_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

function IdentityLockNotice({ status }: { status: VerificationStatus }) {
  if (status === 'verified') {
    return (
      <div
        className="mt-2 rounded-md border border-green-500/20 bg-green-500/5 px-3 py-2"
        role="status"
      >
        <p className="text-xs text-green-300">
          Your identity is verified. Legal name, phone, and date of birth are locked to match
          your verified documents. Contact an administrator if you need changes. Details are in
          the{' '}
          <Link
            href="/profile?tab=security"
            className="font-medium text-screenriot-accent underline underline-offset-2 hover:text-screenriot-accent/90"
          >
            Security
          </Link>{' '}
          tab.
        </p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div
        className="mt-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2"
        role="status"
      >
        <p className="text-xs text-amber-300">
          Identity fields are locked while your documents are under review. Only an administrator
          can change them after verification is complete.
        </p>
      </div>
    );
  }

  return null;
}

export function ProfileTab({ initialProfile }: ProfileTabProps) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isFilmmaker = profile.role === 'filmmaker';
  const identityLocked = profile.identityLocked ?? false;
  const verificationStatus = profile.verification?.status ?? 'not_started';
  const emailVerified = !!profile.emailVerifiedAt;

  function update<K extends keyof ProfileData>(field: K, value: ProfileData[K]) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaveMessage('');
  }

  function updateFilmmaker(field: string, value: string | string[]) {
    setProfile((prev) => ({
      ...prev,
      filmmaker: { ...prev.filmmaker!, [field]: value },
    }));
    setSaveMessage('');
  }

  function toggleSpecialization(spec: string) {
    const current = profile.filmmaker?.specialization ?? [];
    const next = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    updateFilmmaker('specialization', next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    try {
      const body: Record<string, unknown> = {
        displayName: profile.displayName || undefined,
        bio: profile.bio || undefined,
        website: profile.website || undefined,
        socialTwitter: profile.socialTwitter || undefined,
        socialInstagram: profile.socialInstagram || undefined,
        socialLinkedin: profile.socialLinkedin || undefined,
      };
      if (!identityLocked) {
        body.firstName = profile.firstName || undefined;
        body.lastName = profile.lastName || undefined;
        body.phone = profile.phone || undefined;
        body.dateOfBirth = profile.dateOfBirth || undefined;
        body.country = profile.country || undefined;
        body.city = profile.city || undefined;
      }
      if (isFilmmaker && profile.filmmaker) {
        body.filmmaker = {
          productionCompany: profile.filmmaker.productionCompany || undefined,
          imdbUrl: profile.filmmaker.imdbUrl || undefined,
          statement: profile.filmmaker.filmmakerStatement || undefined,
          yearsOfExperience: profile.filmmaker.yearsOfExperience
            ? Number(profile.filmmaker.yearsOfExperience)
            : undefined,
          specialization: profile.filmmaker.specialization,
        };
      }
      const updated = await updateProfile(session?.accessToken, body);
      setProfile(updated);
      setSaveMessage('Profile saved successfully.');
    } catch {
      setSaveMessage('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    if (!AVATAR_MIMES.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      alert('Image is too large. Maximum size is 5 MB.');
      return;
    }
    setAvatarUploading(true);
    try {
      const { avatarUrl } = await uploadAvatar(session?.accessToken, file);
      setProfile((prev) => ({ ...prev, avatarUrl }));
    } catch {
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }

  const memberDate = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div id="panel-profile" role="tabpanel" aria-labelledby="tab-profile" className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ——— Avatar ——— */}
        <section className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-screenriot-bg-elevated focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
              aria-label="Change profile photo"
            >
              {profile.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={IMAGES.icons.user}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 text-screenriot-muted"
                />
              )}

              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                {avatarUploading ? (
                  <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                )}
              </span>
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              aria-label="Upload profile photo"
            />
            <p className="mt-2 max-w-[6rem] text-center text-[10px] text-screenriot-muted">
              JPG, PNG, WebP · max 5 MB
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white">Public Profile</h2>
            {memberDate && (
              <p className="mt-1 text-xs text-screenriot-muted">
                Member since {memberDate}
              </p>
            )}
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isFilmmaker
                  ? 'bg-screenriot-accent-blue/20 text-screenriot-accent-blue'
                  : 'bg-white/10 text-gray-300'
              }`}
            >
              {isFilmmaker ? 'Filmmaker' : 'Fan / Investor'}
            </span>
          </div>
        </section>

        {/* ——— Personal Information ——— */}
        <section>
          <h3 className="text-base font-semibold text-white">Personal Information</h3>
          <p className="mt-1 text-xs text-screenriot-muted">
            Basic details about you. Your name and avatar are visible to other community members.
          </p>
          {identityLocked && <IdentityLockNotice status={verificationStatus} />}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first-name" className={LABEL_CLASS}>First Name</label>
              <input
                id="first-name"
                type="text"
                value={profile.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                placeholder="First name"
                disabled={identityLocked}
                className={`${INPUT_CLASS}${identityLocked ? ' cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="last-name" className={LABEL_CLASS}>Last Name</label>
              <input
                id="last-name"
                type="text"
                value={profile.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                placeholder="Last name"
                disabled={identityLocked}
                className={`${INPUT_CLASS}${identityLocked ? ' cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="display-name" className={LABEL_CLASS}>Display Name</label>
              <input
                id="display-name"
                type="text"
                value={profile.displayName}
                onChange={(e) => update('displayName', e.target.value)}
                placeholder="e.g. FilmFan2025"
                className={INPUT_CLASS}
                aria-describedby="display-name-hint"
              />
              <p id="display-name-hint" className="mt-1 text-xs text-screenriot-muted">
                How you appear to the community
              </p>
            </div>
            <div>
              <label htmlFor="email" className={LABEL_CLASS}>Email</label>
              <input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className={`${INPUT_CLASS} cursor-not-allowed opacity-60`}
                aria-describedby="email-hint email-status"
              />
              <div id="email-hint" className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-screenriot-muted">
                <span>{emailVerified ? 'Verified' : 'Not verified'}</span>
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={async () => {
                      setResendMessage('');
                      setResendLoading(true);
                      try {
                        await resendVerificationEmail(session?.accessToken as string | undefined);
                        setResendMessage('Email sent. Check your inbox and click the link.');
                        const updated = await getProfile(session?.accessToken as string | undefined);
                        setProfile(updated);
                      } catch {
                        setResendMessage('Failed to send. Try again later.');
                      } finally {
                        setResendLoading(false);
                      }
                    }}
                    disabled={resendLoading}
                    className="text-xs font-medium text-screenriot-accent-blue hover:underline disabled:opacity-50"
                    aria-describedby="email-status"
                  >
                    {resendLoading ? 'Sending…' : 'Resend'}
                  </button>
                )}
              </div>
              {resendMessage && (
                <p id="email-status" className="mt-1 text-xs text-screenriot-muted" role="status">
                  {resendMessage}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className={LABEL_CLASS}>Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                disabled={identityLocked}
                className={`${INPUT_CLASS}${identityLocked ? ' cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="dob" className={LABEL_CLASS}>Date of Birth</label>
              <input
                id="dob"
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
                disabled={identityLocked}
                className={`${INPUT_CLASS} [color-scheme:dark]${identityLocked ? ' cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="country" className={LABEL_CLASS}>Country</label>
              <select
                id="country"
                value={profile.country}
                onChange={(e) => update('country', e.target.value)}
                disabled={identityLocked}
                className={`${INPUT_CLASS}${identityLocked ? ' cursor-not-allowed opacity-60' : ''}`}
              >
                <option value="">Select country</option>
                {PROFILE_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className={LABEL_CLASS}>City</label>
              <input
                id="city"
                type="text"
                value={profile.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="City"
                disabled={identityLocked}
                className={`${INPUT_CLASS}${identityLocked ? ' cursor-not-allowed opacity-60' : ''}`}
              />
            </div>
          </div>
        </section>

        {/* ——— About ——— */}
        <section>
          <h3 className="text-base font-semibold text-white">About</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="bio" className={LABEL_CLASS}>Bio</label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => update('bio', e.target.value.slice(0, BIO_MAX))}
                placeholder="Tell the community about yourself…"
                rows={3}
                maxLength={BIO_MAX}
                className={INPUT_CLASS}
                aria-describedby="bio-hint"
              />
              <p id="bio-hint" className="mt-1 text-xs text-screenriot-muted">
                {profile.bio.length}/{BIO_MAX} characters
              </p>
            </div>
            <div>
              <label htmlFor="website" className={LABEL_CLASS}>Website</label>
              <input
                id="website"
                type="url"
                value={profile.website}
                onChange={(e) => update('website', e.target.value)}
                placeholder="https://yoursite.com"
                className={INPUT_CLASS}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="social-twitter" className={LABEL_CLASS}>X (Twitter)</label>
                <input
                  id="social-twitter"
                  type="text"
                  value={profile.socialTwitter}
                  onChange={(e) => update('socialTwitter', e.target.value)}
                  placeholder="@handle"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="social-instagram" className={LABEL_CLASS}>Instagram</label>
                <input
                  id="social-instagram"
                  type="text"
                  value={profile.socialInstagram}
                  onChange={(e) => update('socialInstagram', e.target.value)}
                  placeholder="@handle"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="social-linkedin" className={LABEL_CLASS}>LinkedIn</label>
                <input
                  id="social-linkedin"
                  type="text"
                  value={profile.socialLinkedin}
                  onChange={(e) => update('socialLinkedin', e.target.value)}
                  placeholder="profile-slug"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ——— Filmmaker Details (filmmaker only) ——— */}
        {isFilmmaker && profile.filmmaker && (
          <section className="rounded-lg border border-screenriot-accent-blue/20 bg-screenriot-accent-blue/5 p-5">
            <h3 className="text-base font-semibold text-white">Filmmaker Details</h3>
            <p className="mt-1 text-xs text-screenriot-muted">
              This information is shown on your public filmmaker profile and helps investors learn about you.
            </p>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="production-company" className={LABEL_CLASS}>
                    Production Company
                  </label>
                  <input
                    id="production-company"
                    type="text"
                    value={profile.filmmaker.productionCompany}
                    onChange={(e) => updateFilmmaker('productionCompany', e.target.value)}
                    placeholder="Your production company name"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="imdb-url" className={LABEL_CLASS}>IMDb Profile</label>
                  <input
                    id="imdb-url"
                    type="url"
                    value={profile.filmmaker.imdbUrl}
                    onChange={(e) => updateFilmmaker('imdbUrl', e.target.value)}
                    placeholder="https://www.imdb.com/name/..."
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="filmmaker-statement" className={LABEL_CLASS}>
                  Filmmaker Statement
                </label>
                <textarea
                  id="filmmaker-statement"
                  value={profile.filmmaker.filmmakerStatement}
                  onChange={(e) =>
                    updateFilmmaker('filmmakerStatement', e.target.value.slice(0, STATEMENT_MAX))
                  }
                  placeholder="Share your vision, artistic philosophy, and what drives your filmmaking…"
                  rows={4}
                  maxLength={STATEMENT_MAX}
                  className={INPUT_CLASS}
                  aria-describedby="statement-hint"
                />
                <p id="statement-hint" className="mt-1 text-xs text-screenriot-muted">
                  {profile.filmmaker.filmmakerStatement.length}/{STATEMENT_MAX} characters
                </p>
              </div>
              <div>
                <label htmlFor="years-experience" className={LABEL_CLASS}>
                  Years of Experience
                </label>
                <input
                  id="years-experience"
                  type="number"
                  min={0}
                  max={70}
                  value={profile.filmmaker.yearsOfExperience}
                  onChange={(e) => updateFilmmaker('yearsOfExperience', e.target.value)}
                  placeholder="0"
                  className={`${INPUT_CLASS} max-w-[8rem]`}
                />
              </div>
              <div>
                <span className={LABEL_CLASS}>Specialization</span>
                <p className="mt-1 text-xs text-screenriot-muted">
                  Select all that apply
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FILMMAKER_SPECIALIZATIONS.map((spec) => {
                    const selected = profile.filmmaker!.specialization.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialization(spec)}
                        aria-pressed={selected}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue ${
                          selected
                            ? 'bg-screenriot-accent-blue text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ——— Investor Badges (fan only) ——— */}
        {!isFilmmaker && (
          <section>
            <h3 className="text-base font-semibold text-white">Investor Badges</h3>
            <p className="mt-1 text-xs text-screenriot-muted">
              Badges earned by backing films and participating in the community
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLACEHOLDER_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    badge.highlight
                      ? 'bg-screenriot-accent/20 text-screenriot-accent'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ——— Save ——— */}
        {saveMessage && (
          <p className="text-sm text-green-400" role="status">{saveMessage}</p>
        )}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-screenriot-accent-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
