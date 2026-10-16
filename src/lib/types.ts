export type Outcome = 'APPROVE' | 'REFER' | 'DECLINE';

export const OUTCOMES: Outcome[] = ['APPROVE', 'REFER', 'DECLINE'];

export interface PipelineStats {
  applied: number;
  duplicates: number;
  rejected: number;
  transientFailures: number;
}

export interface Flip {
  applicantId: string;
  before: Outcome;
  after: Outcome;
  newReasonCodes: string[];
}

export interface ImpactReport {
  baselineVersion: string;
  candidateVersion: string;
  applications: number;
  baselineOutcomes: Partial<Record<Outcome, number>>;
  candidateOutcomes: Partial<Record<Outcome, number>>;
  transitions: Record<string, number>;
  flips: Flip[];
}
