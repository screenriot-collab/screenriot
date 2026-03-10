import { IsObject } from 'class-validator';

/** Scores per category id, e.g. { story: 8, script: 9, casting: 7 }. Values 1-10, all categories required. */
export class CreatePledgeVoteDto {
  @IsObject()
  scores!: Record<string, number>;
}

export function validatePledgeScores(
  scores: Record<string, number>,
  categoryIds: string[],
): { valid: boolean; message?: string } {
  if (categoryIds.length === 0) return { valid: false, message: 'No categories configured' };
  for (const id of categoryIds) {
    const v = scores[id];
    if (typeof v !== 'number' || Number.isNaN(v) || v < 1 || v > 10) {
      return { valid: false, message: `Score for "${id}" must be between 1 and 10` };
    }
  }
  const allowed = new Set(categoryIds);
  for (const key of Object.keys(scores)) {
    if (!allowed.has(key)) return { valid: false, message: `Unknown category: ${key}` };
  }
  return { valid: true };
}
