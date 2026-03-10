import type { ReactNode } from 'react';
import { STEP_HEADER, STEP_NUM, STEP_CARD, COMMENT_INPUT } from '@/constants/styles';

type StepCardProps = {
  step: number;
  title: string;
  comment: string;
  onCommentChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
};

export function StepCard({ step, title, comment, onCommentChange, disabled, children }: StepCardProps) {
  const commentId = `comment-step${step}`;

  return (
    <div className={STEP_CARD}>
      <p className={STEP_HEADER}>
        <span className={STEP_NUM}>{step}</span>
        {title}
      </p>
      <div className="mt-3">{children}</div>
      <div className="mt-4">
        <label className="mb-1 block text-xs text-gray-500" htmlFor={commentId}>
          Admin comment
        </label>
        <textarea
          id={commentId}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className={COMMENT_INPUT}
          rows={2}
          placeholder="Comment for this step…"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
