import {
  STEP_4_SECTION,
  STEP_4_BUDGET,
  STEP_4_TIMELINE,
  STEP_4_CAMPAIGN,
} from '@/markup/submit-project';
import type { SubmitProjectFormData } from '@/types/submit-project';

type Step4Data = NonNullable<SubmitProjectFormData['step4']>;

interface Step4Props {
  step4: Step4Data;
  error: string | null;
  onSetStep4: (update: Partial<Step4Data>) => void;
  onUpdateBreakdown: (index: number, percent: number) => void;
  onUpdateTimeline: (field: keyof Step4Data['timeline'], value: string) => void;
}

export function Step4Budget({
  step4,
  error,
  onSetStep4,
  onUpdateBreakdown,
  onUpdateTimeline,
}: Step4Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">{STEP_4_SECTION.title}</h2>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Total budget */}
      <div>
        <label className="block text-sm font-medium text-white">{STEP_4_BUDGET.totalLabel} *</label>
        <div className="mt-1 flex items-center rounded-lg border border-white/20 bg-screenriot-bg">
          <span className="pl-3 text-screenriot-muted">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={step4.totalBudget}
            onChange={(e) => onSetStep4({ ...step4, totalBudget: e.target.value.replace(/\D/g, '') })}
            placeholder="0"
            className="w-full flex-1 bg-transparent px-2 py-2.5 text-white placeholder:text-screenriot-muted focus:outline-none"
          />
        </div>
      </div>

      {/* Breakdown */}
      <div>
        <label className="block text-sm font-medium text-white">{STEP_4_BUDGET.breakdownLabel} *</label>
        <p className="mt-0.5 text-xs text-screenriot-muted">Must total 100%</p>
        <div className="mt-2 space-y-2 rounded-lg border border-white/10 bg-screenriot-bg p-3">
          {(step4.breakdown ?? []).map((row, i) => (
            <div key={row.id} className="flex items-center justify-between gap-4">
              <span className="text-sm text-white">{row.label}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={row.percent}
                  onChange={(e) =>
                    onUpdateBreakdown(i, Math.max(0, Math.min(100, Number(e.target.value) || 0)))
                  }
                  className="w-16 rounded border border-white/20 bg-screenriot-bg-card px-2 py-1 text-right text-sm text-white focus:border-screenriot-accent-blue focus:outline-none"
                />
                <span className="text-screenriot-muted">%</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-medium">
            <span className="text-white">Total</span>
            <span className="text-white">
              {(step4.breakdown ?? []).reduce((s, r) => s + r.percent, 0)} %
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-medium text-white">{STEP_4_TIMELINE.label}</label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {STEP_4_TIMELINE.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-xs font-medium text-screenriot-muted">{field.label}</label>
              <input
                type="date"
                value={step4.timeline[field.id as keyof Step4Data['timeline']] || ''}
                onChange={(e) =>
                  onUpdateTimeline(field.id as keyof Step4Data['timeline'], e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-sm text-white focus:border-screenriot-accent-blue focus:outline-none [color-scheme:dark]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Campaign duration */}
      <div>
        <label className="block text-sm font-medium text-white">{STEP_4_CAMPAIGN.label} *</label>
        <p className="mt-0.5 text-xs text-screenriot-muted">{STEP_4_CAMPAIGN.description}</p>
        <input
          type="number"
          min={1}
          max={365}
          value={step4.campaignDuration}
          onChange={(e) => onSetStep4({ ...step4, campaignDuration: e.target.value })}
          placeholder={STEP_4_CAMPAIGN.placeholder}
          className="mt-2 w-full max-w-xs rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none"
        />
      </div>
    </div>
  );
}
