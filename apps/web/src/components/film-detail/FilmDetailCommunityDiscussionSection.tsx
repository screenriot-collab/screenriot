'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CommunityDiscussionMock } from '@/markup/film-detail';
import type { DiscussionComment, DiscussionSort } from '@/lib/films-api';
import {
  createDiscussionComment,
  fetchFilmDiscussion,
  toggleDiscussionUpvote,
} from '@/lib/films-api';
import { getErrorMessage } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { ParticipationGateModal } from '@/components/film-detail/ParticipationGateModal';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useParticipationGate } from '@/hooks/use-participation-gate';

type SortKey = DiscussionSort;

const SORT_TABS: { id: SortKey; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'new', label: 'New' },
  { id: 'trending', label: 'Trending' },
];

interface FilmDetailCommunityDiscussionSectionProps {
  data: CommunityDiscussionMock;
  filmId?: string;
  filmSlug?: string;
}

function updateCommentTree(
  nodes: DiscussionComment[],
  commentId: string,
  updater: (node: DiscussionComment) => DiscussionComment,
): DiscussionComment[] {
  return nodes.map((node) => {
    if (node.id === commentId) return updater(node);
    if (node.replies.length > 0) {
      return { ...node, replies: updateCommentTree(node.replies, commentId, updater) };
    }
    return node;
  });
}

function DiscussionCommentItem({
  comment,
  depth,
  filmId,
  canParticipate,
  requireParticipation,
  accessToken,
  onUpvote,
  onReplyPosted,
}: {
  comment: DiscussionComment;
  depth: number;
  filmId: string;
  canParticipate: boolean;
  requireParticipation: () => boolean;
  accessToken?: string;
  onUpvote: (commentId: string) => void;
  onReplyPosted: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const indentClass = depth > 0 ? 'ml-6 sm:ml-12 mt-4' : '';
  const avatarSize = depth === 0 ? 'h-10 w-10 text-xs' : 'h-8 w-8 text-[10px]';

  async function handlePostReply() {
    if (!requireParticipation() || !accessToken) return;
    const text = replyDraft.trim();
    if (!text) return;
    setReplySubmitting(true);
    setReplyError(null);
    try {
      await createDiscussionComment(filmId, text, accessToken, comment.id);
      setReplyDraft('');
      setReplying(false);
      onReplyPosted();
    } catch (e) {
      setReplyError(getErrorMessage(e, 'Failed to post reply'));
    } finally {
      setReplySubmitting(false);
    }
  }

  return (
    <div className={indentClass}>
      <div className="flex gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-full bg-screenriot-accent-blue/20 font-semibold text-screenriot-accent-blue ${avatarSize}`}
          aria-hidden
        >
          {comment.authorInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="rounded-lg bg-white/[0.04] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-white">{comment.author}</span>
              <span className="text-screenriot-muted">{formatRelativeTime(comment.createdAt)}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{comment.content}</p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
            {comment.isRoot ? (
              <button
                type="button"
                onClick={() => {
                  if (!requireParticipation()) return;
                  onUpvote(comment.id);
                }}
                disabled={!canParticipate}
                className={`inline-flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue/40 rounded ${
                  comment.hasUpvoted
                    ? 'text-screenriot-accent-blue'
                    : 'text-screenriot-muted hover:text-screenriot-accent-blue'
                } disabled:opacity-60`}
                aria-pressed={comment.hasUpvoted}
              >
                <svg
                  className={`h-4 w-4 ${comment.hasUpvoted ? 'fill-current' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.04 9.04 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5h.008v.008H5.9v-.008Z"
                  />
                </svg>
                <span>{comment.upvotes}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (!requireParticipation()) return;
                setReplying((v) => !v);
                setReplyError(null);
              }}
              className="inline-flex items-center gap-1 text-screenriot-muted transition-colors hover:text-screenriot-accent-blue focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue/40 rounded"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
              Reply
            </button>
          </div>

          {replying ? (
            <div className="mt-3 space-y-2">
              <label className="sr-only" htmlFor={`reply-${comment.id}`}>
                Write a reply
              </label>
              <textarea
                id={`reply-${comment.id}`}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={3}
                placeholder="Write your reply…"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-screenriot-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplying(false);
                    setReplyDraft('');
                    setReplyError(null);
                  }}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={replySubmitting || !replyDraft.trim()}
                  onClick={() => void handlePostReply()}
                  className="rounded-lg bg-screenriot-accent-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 disabled:opacity-60"
                >
                  {replySubmitting ? 'Posting…' : 'Post reply'}
                </button>
              </div>
              {replyError ? (
                <p className="text-xs text-red-400" role="alert">
                  {replyError}
                </p>
              ) : null}
            </div>
          ) : null}

          {comment.replies.length > 0 ? (
            <div className="mt-2" role="list">
              {comment.replies.map((reply) => (
                <DiscussionCommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  filmId={filmId}
                  canParticipate={canParticipate}
                  requireParticipation={requireParticipation}
                  accessToken={accessToken}
                  onUpvote={onUpvote}
                  onReplyPosted={onReplyPosted}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FilmDetailCommunityDiscussionSection({
  data,
  filmId,
  filmSlug,
}: FilmDetailCommunityDiscussionSectionProps) {
  const mounted = useHasMounted();
  const signInCallbackUrl = filmSlug ? `/films/${filmSlug}` : undefined;
  const { canParticipate, accessToken, gateVariant, closeGate, requireParticipation } =
    useParticipationGate(signInCallbackUrl);

  const [sortBy, setSortBy] = useState<SortKey>('top');
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const loadDiscussion = useCallback(async () => {
    if (!filmId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchFilmDiscussion(
        filmId,
        { sort: sortBy, page, limit: 20 },
        accessToken,
      );
      setComments((prev) => (page === 1 ? res.comments : [...prev, ...res.comments]));
      setTotal(res.total);
    } catch (e) {
      setLoadError(getErrorMessage(e, 'Failed to load discussion'));
      if (page === 1) setComments([]);
    } finally {
      setLoading(false);
    }
  }, [filmId, sortBy, page, accessToken]);

  useEffect(() => {
    if (!mounted || !filmId) return;
    void loadDiscussion();
  }, [mounted, filmId, loadDiscussion]);

  useEffect(() => {
    setPage(1);
    setComments([]);
  }, [sortBy]);

  async function handlePostComment() {
    if (!filmId || !requireParticipation() || !accessToken) return;
    const text = draft.trim();
    if (!text) return;
    setPosting(true);
    setPostError(null);
    try {
      await createDiscussionComment(filmId, text, accessToken);
      setDraft('');
      setPage(1);
      setComments([]);
      await fetchFilmDiscussion(filmId, { sort: sortBy, page: 1, limit: 20 }, accessToken).then(
        (res) => {
          setComments(res.comments);
          setTotal(res.total);
        },
      );
    } catch (e) {
      setPostError(getErrorMessage(e, 'Failed to post comment'));
    } finally {
      setPosting(false);
    }
  }

  async function handleUpvote(commentId: string) {
    if (!filmId || !accessToken) return;
    try {
      const res = await toggleDiscussionUpvote(filmId, commentId, accessToken);
      setComments((prev) =>
        updateCommentTree(prev, commentId, (node) => ({
          ...node,
          upvotes: res.upvotes,
          hasUpvoted: res.upvoted,
        })),
      );
    } catch (e) {
      setLoadError(getErrorMessage(e, 'Failed to update upvote'));
    }
  }

  function handleReplyPosted() {
    setPage(1);
    setComments([]);
    void loadDiscussion();
  }

  const hasMore = comments.length < total;

  return (
    <section
      className="rounded-xl border border-screenriot-accent-blue/20 bg-screenriot-accent-blue/5 p-6"
      aria-labelledby="community-discussion-heading"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 id="community-discussion-heading" className="text-lg font-semibold text-white">
            {data.title}
          </h2>
          <p className="mt-1 text-sm text-screenriot-muted">{data.subtitle}</p>
        </div>

        {filmId ? (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sort comments">
            {SORT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={sortBy === tab.id}
                onClick={() => setSortBy(tab.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue ${
                  sortBy === tab.id
                    ? 'bg-screenriot-accent-blue text-white'
                    : 'bg-white/10 text-screenriot-muted hover:bg-white/15'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 border-b border-white/10 pb-6">
        <label htmlFor="new-comment" className="block text-sm font-medium text-white">
          Add a comment
        </label>
        <textarea
          id="new-comment"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder={data.commentPlaceholder}
          disabled={!canParticipate && mounted}
          className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-screenriot-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue/30 disabled:opacity-60"
        />
        {!canParticipate && mounted ? (
          <p className="mt-1 text-xs text-screenriot-muted">
            Sign in and complete verification to join the discussion.
          </p>
        ) : null}
        {postError ? (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {postError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={posting || !draft.trim()}
          onClick={() => {
            if (!requireParticipation()) return;
            void handlePostComment();
          }}
          className="mt-3 rounded-lg bg-screenriot-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-screenriot-accent-blue/90 disabled:opacity-60"
        >
          {posting ? 'Posting…' : 'Post comment'}
        </button>
      </div>

      {loadError ? (
        <p className="text-sm text-red-400" role="alert">
          {loadError}
        </p>
      ) : null}

      {loading && page === 1 ? (
        <p className="text-sm text-screenriot-muted">Loading discussion…</p>
      ) : comments.length === 0 && !loading ? (
        <p className="text-sm text-screenriot-muted">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <ul className="space-y-6" role="list">
          {comments.map((comment) => (
            <li key={comment.id}>
              {filmId ? (
                <DiscussionCommentItem
                  comment={comment}
                  depth={0}
                  filmId={filmId}
                  canParticipate={canParticipate}
                  requireParticipation={requireParticipation}
                  accessToken={canParticipate ? accessToken : undefined}
                  onUpvote={(id) => void handleUpvote(id)}
                  onReplyPosted={handleReplyPosted}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {hasMore && filmId ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => setPage((p) => p + 1)}
          className="mt-6 w-full rounded-lg border border-white/15 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-60"
        >
          {loading ? 'Loading…' : `Load more (${comments.length} of ${total})`}
        </button>
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
