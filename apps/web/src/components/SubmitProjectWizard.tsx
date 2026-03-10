'use client';

import {
  SUBMIT_PROJECT_PAGE,
  UPDATE_PROJECT_PAGE,
  SUBMIT_SUCCESS,
  UPDATE_SUCCESS,
  WIZARD_ACTIONS,
} from '@/markup/submit-project';
import { useSubmitProjectWizard } from '@/hooks/useSubmitProjectWizard';
import { WizardStepper } from './submit-project/WizardStepper';
import { Step1ProjectDetails } from './submit-project/Step1ProjectDetails';
import { Step2Materials } from './submit-project/Step2Materials';
import { Step3CastCrew } from './submit-project/Step3CastCrew';
import { Step4Budget } from './submit-project/Step4Budget';
import { Step5Legal } from './submit-project/Step5Legal';
import { SubmissionSuccess } from './submit-project/SubmissionSuccess';
import { AdminReviewComment } from './submit-project/AdminReviewComment';
import type { SubmitProjectFormData, ReviewComments } from '@/types/submit-project';

export type { SubmitProjectFormData };

export interface SubmitProjectWizardProps {
  initialData?: SubmitProjectFormData;
  filmId?: string;
  submissionFeePaid?: boolean;
  reviewStatus?: string | null;
  reviewComments?: ReviewComments | null;
}

export function SubmitProjectWizard({
  initialData,
  filmId,
  submissionFeePaid = false,
  reviewStatus,
  reviewComments,
}: SubmitProjectWizardProps) {
  const wizard = useSubmitProjectWizard({ initialData, filmId, submissionFeePaid });

  const pageCopy = wizard.isEditMode ? UPDATE_PROJECT_PAGE : SUBMIT_PROJECT_PAGE;
  const successCopy = wizard.isEditMode ? UPDATE_SUCCESS : SUBMIT_SUCCESS;
  const submitLabel = wizard.isEditMode
    ? WIZARD_ACTIONS.updateButton
    : WIZARD_ACTIONS.submitButton;

  if (wizard.submitted) {
    return (
      <SubmissionSuccess
        title={successCopy.title}
        description={successCopy.description}
        buttonLabel={successCopy.buttonLabel}
        buttonHref={successCopy.buttonHref}
        uploadWarnings={wizard.uploadWarnings}
      />
    );
  }

  const isFirstStep = wizard.currentStep === 1;
  const isLastStep = wizard.currentStep === 5;

  const stepsWithComments = new Set<number>();
  if (reviewComments) {
    for (let i = 1; i <= 5; i++) {
      const key = `step${i}` as keyof ReviewComments;
      if (reviewComments[key]) stepsWithComments.add(i);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{pageCopy.title}</h1>
        <p className="mt-2 text-screenriot-muted">{pageCopy.subtitle}</p>
      </header>

      <WizardStepper currentStep={wizard.currentStep} stepsWithComments={stepsWithComments.size > 0 ? stepsWithComments : undefined} />

      {reviewStatus === 'action_required' && wizard.isEditMode && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-400">Action Required</p>
            <p className="mt-0.5 text-sm text-amber-200/80">
              A reviewer has requested changes to your project. Please review the feedback on each step and make the necessary updates.
            </p>
          </div>
                </div>
      )}

      <div className="mt-8 rounded-xl border border-white/10 bg-screenriot-bg-card p-6">
        {wizard.currentStep === 1 && (
          <>
            {reviewComments?.step1 && <AdminReviewComment comment={reviewComments.step1} />}
            <Step1ProjectDetails
              step1={wizard.step1}
              error={wizard.stepErrors[1] ?? null}
              onChange={wizard.updateStep1}
            />
          </>
        )}
        {wizard.currentStep === 2 && (
          <>
            {reviewComments?.step2 && <AdminReviewComment comment={reviewComments.step2} />}
            <Step2Materials
              form={wizard.form}
              files={wizard.step2Files}
              error={wizard.stepErrors[2] ?? null}
              onFilesChange={wizard.setStep2Files}
              onClearError={() => wizard.setStepError(2, null)}
            />
          </>
        )}
        {wizard.currentStep === 3 && (
          <>
            {reviewComments?.step3 && <AdminReviewComment comment={reviewComments.step3} />}
            <Step3CastCrew
              step3={wizard.step3}
              error={wizard.stepErrors[3] ?? null}
              onUpdateCast={wizard.updateStep3Cast}
              onUpdateCrew={wizard.updateStep3Crew}
              onAddCast={wizard.addStep3Cast}
              onAddCrew={wizard.addStep3Crew}
              onRemoveCast={wizard.removeStep3Cast}
              onRemoveCrew={wizard.removeStep3Crew}
              onSetStep3={wizard.setStep3}
            />
          </>
        )}
        {wizard.currentStep === 4 && (
          <>
            {reviewComments?.step4 && <AdminReviewComment comment={reviewComments.step4} />}
            <Step4Budget
              step4={wizard.step4}
              error={wizard.stepErrors[4] ?? null}
              onSetStep4={wizard.setStep4}
              onUpdateBreakdown={wizard.updateStep4BreakdownPercent}
              onUpdateTimeline={wizard.updateStep4Timeline}
            />
          </>
        )}
        {wizard.currentStep === 5 && (
          <>
            {reviewComments?.step5 && <AdminReviewComment comment={reviewComments.step5} />}
            <Step5Legal
              form={wizard.form}
              step5={wizard.step5}
              files={wizard.step5Files}
              error={wizard.stepErrors[5] ?? null}
              submissionFeePaid={wizard.submissionFeePaid}
              onSetStep5={wizard.setStep5}
              onFilesChange={wizard.setStep5Files}
              onClearError={() => wizard.setStepError(5, null)}
            />
          </>
        )}

        {wizard.submitError && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {wizard.submitError}
          </p>
        )}

        <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={wizard.handlePrevious}
            disabled={isFirstStep || wizard.isSubmitting}
            className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={wizard.handleNext}
            disabled={wizard.isSubmitting}
            aria-busy={wizard.isSubmitting ? true : undefined}
            className="rounded-lg bg-screenriot-accent-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
          >
            <span className="inline-flex items-center gap-2">
              {isLastStep && wizard.isSubmitting && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    d="M22 12a10 10 0 0 1-10 10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-75"
                  />
                </svg>
              )}
              {isLastStep ? (wizard.isSubmitting ? 'Saving…' : submitLabel) : 'Next Step'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
