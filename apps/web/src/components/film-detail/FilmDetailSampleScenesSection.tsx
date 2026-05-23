'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SampleScenesMock, ScriptSamplePage } from '@/markup/film-detail';
import { ParticipationGateModal } from '@/components/film-detail/ParticipationGateModal';
import { ActionAlertModal } from '@/components/ui/action-alert-modal';
import { getErrorMessage } from '@/lib/api';
import {
  confirmScriptCreditsPurchase,
  createScriptCreditsCheckout,
  unlockScriptPage,
} from '@/lib/films-api';
import {
  formatScriptUnlockAlert,
  notEnoughCreditsAlert,
} from '@/lib/script-unlock-messages';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useParticipationGate } from '@/hooks/use-participation-gate';

const LOCKED_FAKE_TEXT = `INT. LOCATION - TIME

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore.

CHARACTER NAME
Dialogue text goes here and continues
for multiple lines of script.`;

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
  );
}

interface FilmDetailSampleScenesSectionProps {
  data: SampleScenesMock;
  filmId?: string;
  filmSlug?: string;
}

export function FilmDetailSampleScenesSection({
  data,
  filmId,
  filmSlug,
}: FilmDetailSampleScenesSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [pages, setPages] = useState<ScriptSamplePage[]>(data.pages ?? []);
  const [scriptCredits, setScriptCredits] = useState(data.scriptCredits ?? 0);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [buyingCredits, setBuyingCredits] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const confirmStartedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  function showAlert(next: { title: string; message: string }) {
    setAlert(next);
  }
  const mounted = useHasMounted();
  const signInCallbackUrl = filmSlug ? `/films/${filmSlug}` : undefined;
  const { canParticipate, accessToken, gateVariant, closeGate, requireParticipation } =
    useParticipationGate(signInCallbackUrl);

  const totalPages = data.totalPages > 0 ? data.totalPages : pages.length;
  const readableCount = pages.filter((p) => !p.locked && p.content).length;
  const lockedCount = pages.filter((p) => p.locked).length;
  const hasContent = totalPages > 0;

  const firstReadable = pages.find((p) => !p.locked && p.content);

  useEffect(() => {
    if (!mounted || !searchParams || searchParams.get('credits') !== 'success') return;
    const sessionId = searchParams.get('session_id');
    if (!sessionId || !accessToken || confirmStartedRef.current) return;

    confirmStartedRef.current = true;
    const cleanPath = filmSlug ? `/films/${filmSlug}` : window.location.pathname;

    void (async () => {
      try {
        const res = await confirmScriptCreditsPurchase(sessionId, accessToken);
        setScriptCredits(res.scriptCredits);
        setSuccessMessage(
          res.credited
            ? `${res.creditsAdded} credits added to your balance.`
            : `Your balance is ${res.scriptCredits} credits.`,
        );
      } catch (e) {
        showAlert({
          title: 'Credits not applied',
          message: getErrorMessage(
            e,
            'Payment succeeded but credits could not be applied. Contact support with your receipt.',
          ),
        });
      } finally {
        router.replace(cleanPath, { scroll: false });
      }
    })();
  }, [mounted, searchParams, accessToken, filmSlug, router]);

  async function handleUnlock(pageId: string) {
    if (!filmId) return;
    if (!requireParticipation() || !accessToken) return;

    const cost = data.creditsPerPage > 0 ? data.creditsPerPage : 1;
    if (scriptCredits < cost) {
      showAlert(notEnoughCreditsAlert(cost, scriptCredits));
      return;
    }

    setUnlockingId(pageId);
    setAlert(null);
    try {
      const res = await unlockScriptPage(filmId, pageId, accessToken);
      setPages((prev) =>
        prev.map((p) =>
          p.id === pageId
            ? { id: res.page.id, title: res.page.title, content: res.page.content, locked: false }
            : p,
        ),
      );
      setScriptCredits(res.scriptCredits);
    } catch (e) {
      showAlert(
        formatScriptUnlockAlert(getErrorMessage(e, 'Failed to unlock page'), {
          creditsPerPage: cost,
          scriptCredits,
        }),
      );
    } finally {
      setUnlockingId(null);
    }
  }

  async function handleBuyCredits() {
    if (!requireParticipation() || !accessToken) return;
    setBuyingCredits(true);
    setAlert(null);
    try {
      const origin = window.location.origin;
      const path = window.location.pathname;
      const res = await createScriptCreditsCheckout(
        `${origin}${path}?credits=success&session_id={CHECKOUT_SESSION_ID}`,
        `${origin}${path}?credits=cancel`,
        accessToken,
      );
      window.location.href = res.url;
    } catch (e) {
      showAlert({
        title: 'Could not buy credits',
        message: getErrorMessage(e, 'Failed to start checkout. Please try again.'),
      });
      setBuyingCredits(false);
    }
  }

  if (!hasContent) {
    return (
      <section
        className="rounded-xl border border-screenriot-accent-blue/20 bg-screenriot-accent-blue/5 p-6"
        aria-labelledby="sample-scenes-heading"
      >
        <h2 id="sample-scenes-heading" className="flex items-center gap-2 text-lg font-semibold text-white">
          <BookIcon className="h-5 w-5 shrink-0 text-screenriot-accent-blue" />
          {data.title}
        </h2>
        <p className="mt-2 text-sm text-screenriot-muted">{data.emptyMessage}</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-screenriot-accent-blue/20 bg-screenriot-accent-blue/5 p-6"
      aria-labelledby="sample-scenes-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="sample-scenes-heading" className="flex items-center gap-2 text-lg font-semibold text-white">
            <BookIcon className="h-5 w-5 shrink-0 text-screenriot-accent-blue" />
            {data.title}
          </h2>
          <p className="mt-1 text-sm text-screenriot-muted">
            {expanded
              ? `Viewing ${readableCount} of ${totalPages} pages`
              : 'Preview available screenplay pages'}
          </p>
          {mounted && canParticipate ? (
            <p className="mt-1 text-xs text-screenriot-muted">Your credits: {scriptCredits}</p>
          ) : null}
          {successMessage ? (
            <p className="mt-1 text-xs text-emerald-400" role="status">
              {successMessage}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue"
          aria-expanded={expanded}
        >
          <span className="hidden sm:inline">{expanded ? 'Collapse' : 'Read full script'}</span>
          {expanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {!expanded && firstReadable ? (
        <div className="relative mt-4">
          <div className="max-h-48 overflow-hidden rounded-lg bg-white p-6">
            <h3 className="border-b border-gray-200 pb-2 font-bold text-gray-900">{firstReadable.title}</h3>
            <pre className="mt-3 whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
              {(firstReadable.content ?? '').length > 200
                ? `${(firstReadable.content ?? '').slice(0, 200).trim()}…`
                : firstReadable.content}
            </pre>
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-screenriot-bg/40 to-screenriot-bg"
            aria-hidden
          />
        </div>
      ) : null}

      {expanded ? (
        <div className="mt-6 space-y-6">
          {pages.map((page) =>
            page.locked ? (
              <article
                key={page.id}
                className="relative overflow-hidden rounded-lg bg-white p-6"
                aria-label={page.title}
              >
                <div className="select-none blur-sm" aria-hidden>
                  <h3 className="border-b border-gray-200 pb-2 font-bold text-gray-900">{page.title}</h3>
                  <pre className="mt-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                    {LOCKED_FAKE_TEXT}
                  </pre>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-transparent via-black/40 to-black/60 px-4">
                  <LockIcon className="h-10 w-10 text-amber-400" />
                  <p className="font-semibold text-white">Locked Page</p>
                  <p className="text-sm text-white/70">
                    Unlock with {data.creditsPerPage} credit{data.creditsPerPage === 1 ? '' : 's'}
                  </p>
                  <button
                    type="button"
                    disabled={unlockingId === page.id}
                    onClick={() => {
                      void handleUnlock(page.id);
                    }}
                    className="rounded-lg bg-screenriot-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-screenriot-accent-blue/90 disabled:opacity-60"
                  >
                    {unlockingId === page.id ? 'Unlocking…' : 'Unlock page'}
                  </button>
                </div>
              </article>
            ) : (
              <article key={page.id} className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="border-b border-gray-200 pb-2 font-bold text-gray-900">{page.title}</h3>
                <pre className="mt-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                  {page.content}
                </pre>
              </article>
            ),
          )}

          {lockedCount > 0 ? (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                disabled={!filmId || Boolean(unlockingId)}
                onClick={() => {
                  const firstLocked = pages.find((p) => p.locked);
                  if (firstLocked) void handleUnlock(firstLocked.id);
                }}
                className="flex-1 rounded-lg bg-gradient-to-r from-screenriot-accent-blue to-blue-600 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                Unlock more pages with credits
              </button>
              <button
                type="button"
                disabled={buyingCredits}
                onClick={() => {
                  void handleBuyCredits();
                }}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-60"
              >
                {buyingCredits ? 'Redirecting…' : 'Buy credits (10 credits = $5)'}
              </button>
            </div>
          ) : null}

        </div>
      ) : null}

      {alert ? (
        <ActionAlertModal
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      ) : null}

      {gateVariant ? (
        <ParticipationGateModal
          variant={gateVariant}
          onClose={closeGate}
          signInCallbackUrl={signInCallbackUrl}
          purpose="participate"
        />
      ) : null}
    </section>
  );
}
