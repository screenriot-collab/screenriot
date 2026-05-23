'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IMAGES } from '@/lib/constants';
import {
  PREFERENCES_GENRES,
  PREFERENCES_ACTORS,
  FOLLOWING_FILMMAKERS,
  NOTIFICATION_OPTIONS,
  CONNECTED_SERVICES,
  INTEGRATIONS_RECOMMENDATIONS,
  DANGER_ZONE,
  type ProfileData,
} from '@/markup/profile';
import {
  ProfileSection,
  Pill,
  ProfileTab,
  VerificationSection,
  AccountSecuritySection,
} from '@/components/profile';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'security', label: 'Security' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const DEFAULT_TAB: TabId = 'profile';

function parseTabId(value: string | null | undefined): TabId {
  if (value && TABS.some((t) => t.id === value)) {
    return value as TabId;
  }
  return DEFAULT_TAB;
}

const CLASS_BUTTON_SECONDARY =
  'rounded bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none';

const CLASS_LIST_ROW =
  'flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-screenriot-bg-card px-4 py-3';

const initialNotifications = Object.fromEntries(
  NOTIFICATION_OPTIONS.map((o) => [o.id, true])
);

export function ProfileView({
  profileData,
  initialTab,
}: {
  profileData: ProfileData;
  initialTab?: TabId;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseTabId(searchParams?.get('tab') ?? initialTab);

  const selectTab = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (tab === DEFAULT_TAB) {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const query = params.toString();
      const path = pathname ?? '/profile';
      router.push(query ? `${path}?${query}` : path, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const [notifications, setNotifications] =
    useState<Record<string, boolean>>(initialNotifications);

  return (
    <>
      <h1 className="text-2xl font-bold text-white">My Profile</h1>
      <p className="mt-1 text-sm text-screenriot-muted">
        Manage your account, preferences, and connected services
      </p>

      <div className="mt-6 border-b border-white/10" role="tablist" aria-label="Profile sections">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => selectTab(tab.id)}
              className={`rounded-t px-4 py-3 text-sm font-medium focus:outline-none ${
                activeTab === tab.id
                  ? 'border-b-2 border-screenriot-accent-blue bg-screenriot-bg-card text-white'
                  : 'text-screenriot-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-0 rounded-b-lg border border-t-0 border-white/10 bg-screenriot-bg-card p-6">
        {activeTab === 'profile' && (
          <ProfileTab initialProfile={profileData} />
        )}

        {activeTab === 'preferences' && (
          <div
            id="panel-preferences"
            role="tabpanel"
            aria-labelledby="tab-preferences"
            className="space-y-6"
          >
            <ProfileSection id="film-pref-heading" heading="Film Preferences">
              <div className="mt-4">
                <p className="text-sm font-medium text-white">Favorite Genres</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PREFERENCES_GENRES.map((genre) => (
                    <Pill key={genre}>{genre}</Pill>
                  ))}
                </div>
                <button type="button" className={`mt-3 ${CLASS_BUTTON_SECONDARY}`}>
                  Edit Genres
                </button>
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-white">Favorite Actors</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PREFERENCES_ACTORS.map((actor) => (
                    <Pill key={actor} icon={<span className="text-screenriot-accent" aria-hidden>★</span>}>
                      {actor}
                    </Pill>
                  ))}
                </div>
                <button type="button" className={`mt-3 ${CLASS_BUTTON_SECONDARY}`}>
                  Add More
                </button>
              </div>
            </ProfileSection>

            <ProfileSection id="following-heading" heading="Following Filmmakers">
              <ul className="mt-4 space-y-3" role="list">
                {FOLLOWING_FILMMAKERS.map((filmmaker) => (
                  <li key={filmmaker.id} className={CLASS_LIST_ROW}>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white"
                        aria-hidden
                      >
                        {filmmaker.initial}
                      </div>
                      <div>
                        <p className="font-medium text-white">{filmmaker.name}</p>
                        <p className="text-xs text-screenriot-muted">
                          {filmmaker.projectsCount} project{filmmaker.projectsCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button type="button" className={CLASS_BUTTON_SECONDARY}>
                      Following
                    </button>
                  </li>
                ))}
              </ul>
            </ProfileSection>

            <ProfileSection id="notifications-heading" heading="Notifications">
              <ul className="mt-4 space-y-4" role="list">
                {NOTIFICATION_OPTIONS.map((opt) => {
                  const isOn = notifications[opt.id] ?? true;
                  return (
                    <li key={opt.id} className={CLASS_LIST_ROW}>
                      <div>
                        <p className="font-medium text-white">{opt.label}</p>
                        <p className="mt-0.5 text-sm text-screenriot-muted">
                          {opt.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isOn}
                        aria-label={`Toggle ${opt.label}`}
                        onClick={() =>
                          setNotifications((prev) => ({
                            ...prev,
                            [opt.id]: !isOn,
                          }))
                        }
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg ${
                          isOn ? 'bg-screenriot-accent-blue' : 'bg-white/20'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            isOn ? 'translate-x-5' : 'translate-x-0'
                          }`}
                          aria-hidden
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ProfileSection>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div
            id="panel-integrations"
            role="tabpanel"
            aria-labelledby="tab-integrations"
            className="space-y-6"
          >
            <ProfileSection id="connected-services-heading" heading="Connected Services">
              <ul className="mt-4 space-y-4" role="list">
                {CONNECTED_SERVICES.map((service) => (
                  <li
                    key={service.id}
                    className={CLASS_LIST_ROW}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center" aria-hidden>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={IMAGES.icons[service.iconKey]}
                          alt=""
                          width={24}
                          height={24}
                          className="h-6 w-6"
                        />
                      </span>
                      <div>
                        <p className="font-medium text-white">{service.name}</p>
                        <p className="mt-0.5 text-sm text-screenriot-muted">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={CLASS_BUTTON_SECONDARY}
                      aria-label={`Connect ${service.name}`}
                    >
                      Connect
                    </button>
                  </li>
                ))}
              </ul>
            </ProfileSection>

            <ProfileSection
              id="recommendations-heading"
              heading={
                <span className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={IMAGES.icons.starOutline}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 shrink-0"
                    aria-hidden
                  />
                  {INTEGRATIONS_RECOMMENDATIONS.title}
                </span>
              }
            >
              <p className="mt-4 text-sm text-screenriot-muted">
                {INTEGRATIONS_RECOMMENDATIONS.description}
              </p>
            </ProfileSection>
          </div>
        )}

        {activeTab === 'security' && (
          <div
            id="panel-security"
            role="tabpanel"
            aria-labelledby="tab-security"
            className="space-y-6"
          >
            <VerificationSection
              role={profileData.role}
              verification={profileData.verification}
            />

            <ProfileSection id="account-security-heading" heading="Account Security">
              <AccountSecuritySection profile={profileData} />
            </ProfileSection>

            <ProfileSection
              id="danger-zone-heading"
              heading={<span className="text-red-500">{DANGER_ZONE.title}</span>}
            >
              <div className="mt-4">
                <p className="font-medium text-white">{DANGER_ZONE.deleteLabel}</p>
                <p className="mt-1 text-sm text-screenriot-muted">
                  {DANGER_ZONE.deleteWarning}
                </p>
                <button
                  type="button"
                  className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-screenriot-bg"
                  aria-label={DANGER_ZONE.deleteButtonText}
                >
                  {DANGER_ZONE.deleteButtonText}
                </button>
              </div>
            </ProfileSection>
          </div>
        )}
      </div>
    </>
  );
}
