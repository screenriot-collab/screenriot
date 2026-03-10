import { z } from 'zod';

const LOGLINE_MAX = 2000;

export const step1Schema = z.object({
  filmTitle: z.string().min(1, 'Film title is required').max(500),
  logline: z.string().min(1, 'Logline is required').max(LOGLINE_MAX),
  synopsis: z.string().min(1, 'Synopsis is required'),
  genre: z.string().min(1, 'Genre is required').max(100),
  runtime: z.string().min(1, 'Runtime is required').max(20),
  rating: z.string().min(1, 'Rating is required').max(20),
  directorName: z.string().min(1, 'Director name is required').max(200),
});

export const step2Schema = z.object({
  screenplayFileName: z.string().optional(),
  posterFileName: z.string().optional(),
  videoFileName: z.string().optional(),
});

const castMemberSchema = z.object({
  actorName: z.string(),
  actorEmail: z.string(),
  role: z.string(),
});

const crewMemberSchema = z.object({
  name: z.string(),
  position: z.string(),
  email: z.string(),
});

export const step3Schema = z
  .object({
    cast: z.array(castMemberSchema),
    crew: z.array(crewMemberSchema),
    wishListCast: z.string(),
  })
  .refine(
    (data) => {
      const hasValidCast = data.cast.some(
        (c) => (c.actorName ?? '').trim() && (c.role ?? '').trim(),
      );
      return data.cast.length >= 1 && hasValidCast;
    },
    { message: 'Fill actor and role for at least one cast member', path: ['cast'] },
  )
  .refine(
    (data) => {
      const hasValidCrew = data.crew.some(
        (c) => (c.name ?? '').trim() && (c.position ?? '').trim() && (c.email ?? '').trim(),
      );
      return data.crew.length >= 1 && hasValidCrew;
    },
    { message: 'Fill name, position, and email for at least one crew member', path: ['crew'] },
  );

const breakdownItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  percent: z.number(),
});

export const step4Schema = z
  .object({
    totalBudget: z.string().min(1, 'Total budget is required'),
    breakdown: z.array(breakdownItemSchema),
    timeline: z.object({
      preProductionStart: z.string(),
      principalPhotography: z.string(),
      postProduction: z.string(),
      expectedRelease: z.string(),
    }),
    campaignDuration: z.string().min(1, 'Campaign duration is required'),
  })
  .refine(
    (data) => {
      const sum = (data.breakdown ?? []).reduce((s, r) => s + (r.percent ?? 0), 0);
      return Math.abs(sum - 100) <= 0.01;
    },
    { message: 'Budget breakdown must sum to 100%', path: ['breakdown'] },
  );

export const step5Schema = z.object({
  agreeTerms: z.boolean().refine((v) => v === true, 'You must accept the Platform Terms'),
  agreeAgreement: z.boolean().refine((v) => v === true, 'You must accept the Participation Agreement'),
  currency: z.enum(['USD', 'GBP']),
  chainOfTitleFileName: z.string().optional(),
});

export const submitProjectSchema = z.object({
  step1: step1Schema.optional(),
  step2: step2Schema.optional(),
  step3: step3Schema.optional(),
  step4: step4Schema.optional(),
  step5: step5Schema.optional(),
});

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type Step5Input = z.infer<typeof step5Schema>;
export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;
