import { OUTCOMES, type Flip, type ImpactReport, type Outcome, type PipelineStats } from './types';

export function pct(part: number, whole: number): string {
  if (whole <= 0) return '0.0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

export interface OutcomeDelta {
  outcome: Outcome;
  before: number;
  after: number;
  delta: number;
}

export function outcomeDeltas(report: ImpactReport): OutcomeDelta[] {
  return OUTCOMES.map((outcome) => {
    const before = report.baselineOutcomes[outcome] ?? 0;
    const after = report.candidateOutcomes[outcome] ?? 0;
    return { outcome, before, after, delta: after - before };
  });
}

/** Approvals that would become declines are the change a credit reviewer cares about most. */
export function riskiestTransition(report: ImpactReport): { key: string; count: number } | null {
  const severity: Record<Outcome, number> = { APPROVE: 0, REFER: 1, DECLINE: 2 };
  let best: { key: string; count: number; score: number } | null = null;
  for (const [key, count] of Object.entries(report.transitions)) {
    const [from, to] = key.split('->') as [Outcome, Outcome];
    const score = (severity[to] - severity[from]) * 1000 + count;
    if (severity[to] > severity[from] && (best === null || score > best.score)) {
      best = { key, count, score };
    }
  }
  return best ? { key: best.key, count: best.count } : null;
}

export function filterFlips(flips: Flip[], transition: string, search: string): Flip[] {
  const q = search.trim().toLowerCase();
  return flips.filter((f) => {
    const matchesTransition = transition === 'ALL' || `${f.before}->${f.after}` === transition;
    const matchesSearch =
      q === '' ||
      f.applicantId.toLowerCase().includes(q) ||
      f.newReasonCodes.some((c) => c.toLowerCase().includes(q));
    return matchesTransition && matchesSearch;
  });
}

export function pipelineHealth(stats: PipelineStats): { total: number; errorRate: string; status: 'healthy' | 'degraded' } {
  const total = stats.applied + stats.duplicates + stats.rejected;
  const errorRatio = total === 0 ? 0 : (stats.rejected + stats.transientFailures) / total;
  return { total, errorRate: pct(stats.rejected + stats.transientFailures, total), status: errorRatio > 0.1 ? 'degraded' : 'healthy' };
}
