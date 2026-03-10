import { IMAGES } from '@/lib/constants';
import { SUBMIT_STEPS } from '@/markup/submit-project';

interface WizardStepperProps {
  currentStep: number;
  stepsWithComments?: Set<number>;
}

export function WizardStepper({ currentStep, stepsWithComments }: WizardStepperProps) {
  return (
    <nav className="mt-8" aria-label="Application steps">
      <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        {SUBMIT_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isPast = currentStep > step.id;
          const hasComment = stepsWithComments?.has(step.id);
          return (
            <li key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <span
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-white ${
                    isActive
                      ? 'border-screenriot-accent-blue bg-screenriot-accent-blue'
                      : isPast
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-white/30 bg-white/5'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={IMAGES.icons[step.iconKey]}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  {hasComment && (
                    <span
                      className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-screenriot-bg bg-amber-400"
                      aria-label="Has reviewer feedback"
                    />
                  )}
                </span>
                <span
                  className={`mt-1 text-xs font-medium sm:text-sm ${
                    hasComment
                      ? 'text-amber-400'
                      : isActive
                        ? 'text-screenriot-accent-blue'
                        : 'text-screenriot-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < SUBMIT_STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-6 sm:mx-4 sm:w-12 ${
                    isPast ? 'bg-green-500/50' : isActive ? 'bg-screenriot-accent-blue' : 'bg-white/20'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
