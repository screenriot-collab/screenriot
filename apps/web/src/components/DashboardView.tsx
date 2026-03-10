'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IMAGES } from '@/lib/constants';
import { useMyDonations } from '@/hooks/useMyDonations';
import {
  DASHBOARD_HEADER,
  WALLET_CARD,
  TOTAL_INVESTED_CARD,
  EARNINGS_CARD,
  PLEDGES_CARD,
  PAYMENT_PREFERENCE,
  DASHBOARD_TABS,
  VOTING_ABOUT,
  VOTING_ENTRIES,
  EARNINGS_ENTRIES,
  PERKS_INVESTOR_STATUS,
  PERKS_UNLOCKED,
  PERKS_UPCOMING,
} from '@/markup/dashboard';

type TabId = (typeof DASHBOARD_TABS)[number]['id'];

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DashboardView() {
  const [paymentFiat, setPaymentFiat] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('investments');
  const { donations, totalInvested, loading: donationsLoading, error: donationsError } = useMyDonations();

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {DASHBOARD_HEADER.title}
        </h1>
        <p className="mt-1 text-sm text-screenriot-muted">
          {DASHBOARD_HEADER.subtitle}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Financial summary">
        <SummaryCard
          label={WALLET_CARD.label}
          value={WALLET_CARD.value}
          sub={WALLET_CARD.unit}
          description={WALLET_CARD.description}
          iconSrc={IMAGES.icons.wallet}
        />
        <SummaryCard
          label={TOTAL_INVESTED_CARD.label}
          value={donationsLoading ? '—' : formatUsd(totalInvested)}
          iconSrc={IMAGES.icons.chart}
        />
        <SummaryCard
          label={EARNINGS_CARD.label}
          value={EARNINGS_CARD.value}
          description={EARNINGS_CARD.description}
          iconSrc={IMAGES.icons.dollar}
        />
        <SummaryCard
          label={PLEDGES_CARD.label}
          value={PLEDGES_CARD.value}
          description={PLEDGES_CARD.description}
          iconSrc={IMAGES.icons.clock}
        />
      </section>

      <section className="mt-8" aria-labelledby="payment-pref-heading">
        <h2 id="payment-pref-heading" className="text-lg font-semibold text-white">
          {PAYMENT_PREFERENCE.title}
        </h2>
        <p className="mt-1 text-sm text-screenriot-muted">
          {PAYMENT_PREFERENCE.description}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setPaymentFiat(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg ${
              paymentFiat
                ? 'bg-screenriot-accent-blue text-white'
                : 'bg-white/10 text-screenriot-muted hover:bg-white/15'
            }`}
            aria-pressed={paymentFiat}
          >
            {PAYMENT_PREFERENCE.options[0]}
          </button>
          <button
            type="button"
            onClick={() => setPaymentFiat(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg ${
              !paymentFiat
                ? 'bg-screenriot-accent-blue text-white'
                : 'bg-white/10 text-screenriot-muted hover:bg-white/15'
            }`}
            aria-pressed={!paymentFiat}
          >
            {PAYMENT_PREFERENCE.options[1]}
          </button>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-screenriot-accent-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.icons.download} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
          Withdraw Earnings
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-screenriot-bg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.icons.chart} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
          Reinvest in New Films
        </button>
      </div>

      <section className="mt-10" aria-label="Dashboard tabs">
        <div
          className="flex gap-1 border-b border-white/10"
          role="tablist"
          aria-label="Investment sections"
        >
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
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

        <div className="rounded-b-lg border border-t-0 border-white/10 bg-screenriot-bg-card p-6">
          {activeTab === 'investments' && (
            <div
              id="panel-investments"
              role="tabpanel"
              aria-labelledby="tab-investments"
              className="space-y-4"
            >
              {donationsLoading && (
                <p className="text-sm text-screenriot-muted">Loading investments…</p>
              )}
              {donationsError && (
                <p className="text-sm text-red-400" role="alert">{donationsError}</p>
              )}
              {!donationsLoading && !donationsError && donations.length === 0 && (
                <p className="text-sm text-screenriot-muted">
                  No investments yet. Invest in a film from a film page to see them here.
                </p>
              )}
              {!donationsLoading && !donationsError && donations.length > 0 && donations.map((d) => (
                <article
                  key={d.id}
                  className="flex flex-col gap-4 rounded-lg border border-white/10 bg-screenriot-bg p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white" aria-hidden>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={IMAGES.icons.filmReel} alt="" width={24} height={24} className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">
                        <Link
                          href={`/films/${d.filmSlug}`}
                          className="text-white hover:underline focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
                        >
                          {d.filmTitle}
                        </Link>
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${
                            d.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-white/10 text-screenriot-muted'
                          }`}
                        >
                          {d.status}
                        </span>
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-screenriot-muted">
                          {d.filmStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-screenriot-muted">
                        Invested on {formatDate(d.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium text-white">{formatUsd(d.amount)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'voting' && (
            <div id="panel-voting" role="tabpanel" aria-labelledby="tab-voting" className="space-y-4">
              <div className="flex gap-4 rounded-lg border border-white/10 bg-screenriot-bg p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white" aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMAGES.icons.starOutline} alt="" width={24} height={24} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-white">{VOTING_ABOUT.title}</h3>
                  <p className="mt-1 text-sm text-screenriot-muted">{VOTING_ABOUT.description}</p>
                </div>
              </div>
              <ul className="space-y-4" role="list">
                {VOTING_ENTRIES.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-4 rounded-lg border border-white/10 bg-screenriot-bg p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{entry.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">
                          {entry.voteType}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${
                            entry.status === 'locked'
                              ? 'bg-screenriot-accent-blue/20'
                              : 'bg-white/10'
                          }`}
                        >
                          {entry.status === 'locked' && (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={IMAGES.icons.padlock} alt="" width={12} height={12} className="h-3 w-3" />
                            </>
                          )}
                          {entry.status === 'locked' ? 'Locked' : 'Pending'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-screenriot-muted">Voted on {entry.votedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-screenriot-muted">Pledge Amount</p>
                      <p className="text-lg font-bold text-white">{entry.pledgeAmount}</p>
                      <p className={entry.outcome === 'converted' ? 'text-sm font-medium text-green-400' : 'text-sm text-white'}>
                        {entry.outcome === 'converted' ? 'Converted to investment' : 'In escrow'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div id="panel-earnings" role="tabpanel" aria-labelledby="tab-earnings" className="space-y-4">
              {EARNINGS_ENTRIES.map((entry) => (
                <article
                  key={entry.id}
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-screenriot-bg p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400" aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMAGES.icons.arrowUp} alt="" width={20} height={20} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white">{entry.projectTitle}</h3>
                    <span className="mt-0.5 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-screenriot-muted">
                      {entry.distributionType}
                    </span>
                    <p className="mt-1 text-xs text-screenriot-muted">{entry.date}</p>
                  </div>
                  <p className="shrink-0 text-lg font-semibold text-green-400">{entry.amount}</p>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'perks' && (
            <div id="panel-perks" role="tabpanel" aria-labelledby="tab-perks" className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-screenriot-bg p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-screenriot-accent-blue/20 text-white" aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMAGES.icons.shield} alt="" width={24} height={24} className="h-6 w-6" />
                  </span>
                  <h3 className="font-semibold text-white">{PERKS_INVESTOR_STATUS.title}</h3>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                    {PERKS_INVESTOR_STATUS.badge}
                  </span>
                  <span className="text-sm text-white">{PERKS_INVESTOR_STATUS.level}</span>
                </div>
                <p className="mt-2 text-sm text-screenriot-muted">{PERKS_INVESTOR_STATUS.description}</p>
                <div className="mt-3">
                  <p className="text-sm text-white">{PERKS_INVESTOR_STATUS.progressLabel}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-screenriot-accent-blue"
                        style={{ width: `${PERKS_INVESTOR_STATUS.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">{PERKS_INVESTOR_STATUS.progressPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-screenriot-bg p-4">
                <h3 className="font-semibold text-white">Unlocked Perks</h3>
                <ul className="mt-3 space-y-3" role="list">
                  {PERKS_UNLOCKED.map((perk) => (
                    <li key={perk.id} className="flex gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                          perk.unlocked ? 'bg-green-500/20' : 'bg-white/10'
                        }`}
                        aria-hidden
                      >
                        {perk.unlocked ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={IMAGES.icons.checkVerified} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={IMAGES.icons.clock} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
                        )}
                      </span>
                      <div>
                        <p className="font-medium text-white">{perk.title}</p>
                        <p className="text-sm text-screenriot-muted">{perk.subtitle}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-white/10 bg-screenriot-bg p-4">
                <h3 className="font-semibold text-white">Upcoming Rewards</h3>
                <ul className="mt-3 space-y-3" role="list">
                  {PERKS_UPCOMING.map((reward) => (
                    <li
                      key={reward.id}
                      className="flex flex-col gap-1 rounded-lg border border-white/5 bg-screenriot-bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">{reward.title}</p>
                        <p className="text-sm text-screenriot-muted">{reward.date}</p>
                      </div>
                      {reward.tag != null ? (
                        <span className="shrink-0 rounded-full bg-screenriot-accent-blue/20 px-2.5 py-0.5 text-xs font-medium text-white">
                          {reward.tag}
                        </span>
                      ) : (
                        <span className="shrink-0 text-sm text-white">{reward.detail}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  description,
  change,
  changePositive,
  iconSrc,
}: {
  label: string;
  value: string;
  sub?: string;
  description?: string;
  change?: string;
  changePositive?: boolean;
  iconSrc: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-screenriot-bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-screenriot-muted">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconSrc} alt="" width={20} height={20} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-xl font-bold text-white">
        {value}
        {sub != null && <span className="ml-1 text-sm font-normal text-screenriot-muted">{sub}</span>}
      </p>
      {description != null && (
        <p className="mt-0.5 text-xs text-screenriot-muted">{description}</p>
      )}
      {change != null && (
        <p className={`mt-1 text-xs font-medium ${changePositive ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </p>
      )}
    </div>
  );
}
