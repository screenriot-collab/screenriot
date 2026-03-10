import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  step1Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from '@/lib/validations/submit-project';
import {
  createFilm,
  updateFilm,
  uploadFilmFile,
  type CreateFilmBody,
  type UpdateFilmBody,
} from '@/lib/films-api';
import { STEP_4_BUDGET } from '@/markup/submit-project';
import type {
  SubmitProjectFormData,
  Step2Files,
  Step5Files,
  UploadWarning,
} from '@/types/submit-project';

const defaultStep1 = {
  filmTitle: '',
  logline: '',
  synopsis: '',
  genre: '',
  runtime: '',
  rating: '',
  directorName: '',
};

const initialStep3 = {
  cast: [{ actorName: '', actorEmail: '', role: '' }],
  crew: [{ name: '', position: '', email: '' }],
  wishListCast: '',
};

const initialStep4 = {
  totalBudget: '850000',
  breakdown: STEP_4_BUDGET.categories.map((c) => ({
    id: c.id,
    label: c.label,
    percent: c.defaultPercent,
  })),
  timeline: {
    preProductionStart: '',
    principalPhotography: '',
    postProduction: '',
    expectedRelease: '',
  },
  campaignDuration: '30',
};

const initialStep5: NonNullable<SubmitProjectFormData['step5']> = {
  agreeTerms: false,
  agreeAgreement: false,
  currency: 'USD',
};

export interface UseSubmitProjectWizardOptions {
  initialData?: SubmitProjectFormData;
  filmId?: string;
  submissionFeePaid?: boolean;
}

export function useSubmitProjectWizard({
  initialData,
  filmId,
  submissionFeePaid = false,
}: UseSubmitProjectWizardOptions) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const isEditMode = !!(filmId ?? initialData);

  const form = useForm<SubmitProjectFormData>({
    defaultValues: {
      step1: initialData?.step1 ?? defaultStep1,
      step2: initialData?.step2 ?? {},
      step3: initialData?.step3 ?? initialStep3,
      step4: initialData?.step4 ?? initialStep4,
      step5: initialData?.step5 ?? initialStep5,
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<number, string | null>>({});
  const [step2Files, setStep2Files] = useState<Step2Files>({
    screenplay: null,
    poster: null,
    video: null,
  });
  const [step5Files, setStep5Files] = useState<Step5Files>({ chainOfTitle: null });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadWarnings, setUploadWarnings] = useState<UploadWarning[]>([]);

  const step1 = form.watch('step1') ?? defaultStep1;
  const step3 = form.watch('step3') ?? initialStep3;
  const step4 = form.watch('step4') ?? initialStep4;
  const step5 = form.watch('step5') ?? initialStep5;

  function setStepError(step: number, error: string | null) {
    setStepErrors((prev) => ({ ...prev, [step]: error }));
  }

  function updateStep1(field: keyof typeof defaultStep1, value: string) {
    const prev = form.getValues('step1') ?? defaultStep1;
    form.setValue('step1', { ...prev, [field]: value }, { shouldValidate: false });
    setStepError(1, null);
  }

  function setStep3(update: Partial<SubmitProjectFormData['step3']>) {
    const prev = form.getValues('step3') ?? initialStep3;
    form.setValue('step3', { ...initialStep3, ...prev, ...update }, { shouldValidate: false });
    setStepError(3, null);
  }

  function updateStep3Cast(index: number, field: 'actorName' | 'actorEmail' | 'role', value: string) {
    const next = [...(step3.cast ?? [])];
    if (!next[index]) return;
    next[index] = { ...next[index], [field]: value };
    setStep3({ cast: next, crew: step3.crew, wishListCast: step3.wishListCast });
  }

  function updateStep3Crew(
    index: number,
    field: 'name' | 'position' | 'email',
    value: string,
  ) {
    const next = [...(step3.crew ?? [])];
    if (!next[index]) return;
    next[index] = { ...next[index], [field]: value };
    setStep3({ cast: step3.cast, crew: next, wishListCast: step3.wishListCast });
  }

  function addStep3Cast() {
    setStep3({
      cast: [...(step3.cast ?? []), { actorName: '', actorEmail: '', role: '' }],
      crew: step3.crew,
      wishListCast: step3.wishListCast,
    });
  }

  function addStep3Crew() {
    setStep3({
      cast: step3.cast,
      crew: [...(step3.crew ?? []), { name: '', position: '', email: '' }],
      wishListCast: step3.wishListCast,
    });
  }

  function removeStep3Cast(index: number) {
    const next = (step3.cast ?? []).filter((_, i) => i !== index);
    if (next.length === 0) return;
    setStep3({ cast: next, crew: step3.crew, wishListCast: step3.wishListCast });
  }

  function removeStep3Crew(index: number) {
    const next = (step3.crew ?? []).filter((_, i) => i !== index);
    if (next.length === 0) return;
    setStep3({ cast: step3.cast, crew: next, wishListCast: step3.wishListCast });
  }

  function setStep4(update: Partial<SubmitProjectFormData['step4']>) {
    const prev = form.getValues('step4') ?? initialStep4;
    form.setValue('step4', { ...initialStep4, ...prev, ...update }, { shouldValidate: false });
    setStepError(4, null);
  }

  function updateStep4BreakdownPercent(index: number, percent: number) {
    const next = [...(step4.breakdown ?? [])];
    if (!next[index]) return;
    next[index] = { ...next[index], percent };
    setStep4({ ...step4, breakdown: next });
  }

  function updateStep4Timeline(
    field: keyof NonNullable<SubmitProjectFormData['step4']>['timeline'],
    value: string,
  ) {
    setStep4({ ...step4, timeline: { ...step4.timeline, [field]: value } });
  }

  function setStep5(update: Partial<NonNullable<SubmitProjectFormData['step5']>>) {
    const prev = form.getValues('step5') ?? initialStep5;
    form.setValue('step5', { ...initialStep5, ...prev, ...update }, { shouldValidate: false });
    setStepError(5, null);
  }

  function validateCurrentStep(): boolean {
    const values = form.getValues();

    if (currentStep === 1) {
      const result = step1Schema.safeParse(values.step1 ?? defaultStep1);
      if (!result.success) {
        setStepError(1, result.error.errors[0]?.message ?? 'Please fix the errors below');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!step2Files.screenplay && !values.step2?.screenplayFileName) {
        setStepError(2, 'Screenplay is required');
        return false;
      }
    }
    if (currentStep === 3) {
      const result = step3Schema.safeParse(values.step3 ?? step3);
      if (!result.success) {
        setStepError(3, result.error.errors[0]?.message ?? 'Please fix cast and crew');
        return false;
      }
    }
    if (currentStep === 4) {
      const result = step4Schema.safeParse(values.step4 ?? step4);
      if (!result.success) {
        setStepError(4, result.error.errors[0]?.message ?? 'Please fix budget and timeline');
        return false;
      }
    }
    if (currentStep === 5) {
      const result = step5Schema.safeParse(values.step5 ?? step5);
      if (!result.success) {
        setStepError(5, result.error.errors[0]?.message ?? 'Please accept agreements');
        return false;
      }
      if (!step5Files.chainOfTitle && !values.step5?.chainOfTitleFileName) {
        setStepError(5, 'Chain of Title documentation is required');
        return false;
      }
    }

    setStepError(currentStep, null);
    return true;
  }

  async function submitProject() {
    let targetId = filmId ?? '';
    const v = form.getValues();
    const step1Data = v.step1 ?? defaultStep1;
    const step3Data = v.step3 ?? initialStep3;
    const step4Data = v.step4 ?? initialStep4;

    if (!filmId) {
      const goalAmount = Number(step4Data.totalBudget) || 0;
      const body: CreateFilmBody = {
        title: step1Data.filmTitle.trim(),
        logline: step1Data.logline.trim(),
        synopsis: step1Data.synopsis.trim(),
        genre: step1Data.genre.trim(),
        runtime: step1Data.runtime.trim(),
        rating: step1Data.rating.trim(),
        directorName: step1Data.directorName.trim(),
        goalAmount: isNaN(goalAmount) ? undefined : goalAmount,
      };
      const created = await createFilm(body, accessToken);
      targetId = created.id;
      await updateFilm(targetId, { step3: step3Data, step4: step4Data }, accessToken);
    } else {
      const body: UpdateFilmBody = {
        title: step1Data.filmTitle.trim(),
        logline: step1Data.logline.trim(),
        synopsis: step1Data.synopsis.trim(),
        genre: step1Data.genre.trim(),
        runtime: step1Data.runtime.trim(),
        rating: step1Data.rating.trim(),
        directorName: step1Data.directorName.trim(),
        step3: step3Data,
        step4: step4Data,
      };
      await updateFilm(filmId, body, accessToken);
    }

    if (!targetId) return;

    const slots: { slot: UploadWarning['slot']; file: File }[] = [];
    if (step2Files.screenplay) slots.push({ slot: 'screenplay', file: step2Files.screenplay });
    if (step2Files.poster) slots.push({ slot: 'poster', file: step2Files.poster });
    if (step2Files.video) slots.push({ slot: 'teaser', file: step2Files.video });
    if (step5Files.chainOfTitle)
      slots.push({ slot: 'chain-of-title', file: step5Files.chainOfTitle });

    const failed: UploadWarning[] = [];
    for (const { slot, file } of slots) {
      try {
        await uploadFilmFile(targetId, slot, file, accessToken);
      } catch {
        failed.push({ slot, fileName: file.name });
      }
    }
    if (failed.length > 0) setUploadWarnings(failed);
    setSubmitted(true);
  }

  function handleNext() {
    if (isSubmitting) return;
    if (!validateCurrentStep()) return;

    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
      return;
    }

    setSubmitError(null);
    void (async () => {
      try {
        setIsSubmitting(true);
        setUploadWarnings([]);
        await submitProject();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Submission failed';
        const hasId = !!(filmId ?? '');
        setSubmitError(
          hasId
            ? `${message} The project may have been saved. Open My Films and edit the project to re-upload any missing files.`
            : message,
        );
        if (hasId) router.refresh();
        setIsSubmitting(false);
      }
    })();
  }

  function handlePrevious() {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, submitted]);

  return {
    currentStep,
    isEditMode,
    submissionFeePaid,
    submitted,
    isSubmitting,
    submitError,
    uploadWarnings,
    stepErrors,
    step1,
    step3,
    step4,
    step5,
    step2Files,
    step5Files,
    form,
    updateStep1,
    setStep2Files,
    setStep5Files,
    setStep3,
    updateStep3Cast,
    updateStep3Crew,
    addStep3Cast,
    addStep3Crew,
    removeStep3Cast,
    removeStep3Crew,
    setStep4,
    updateStep4BreakdownPercent,
    updateStep4Timeline,
    setStep5,
    setStepError,
    handleNext,
    handlePrevious,
  };
}
