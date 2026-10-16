import { describe, expect, it } from 'vitest';
import report from '../fixtures/impact-report.json';
import { filterFlips, outcomeDeltas, pct, pipelineHealth, riskiestTransition } from './impact';
import type { ImpactReport } from './types';

const r = report as ImpactReport;

describe('impact helpers', () => {
  it('formats percentages safely', () => {
    expect(pct(35, 250)).toBe('14.0%');
    expect(pct(1, 0)).toBe('0.0%');
  });

  it('computes outcome deltas that net to zero', () => {
    const deltas = outcomeDeltas(r);
    expect(deltas.map((d) => d.outcome)).toEqual(['APPROVE', 'REFER', 'DECLINE']);
    expect(deltas.reduce((sum, d) => sum + d.delta, 0)).toBe(0);
  });

  it('flags approve-to-decline as the riskiest tightening', () => {
    expect(riskiestTransition(r)).toEqual({ key: 'APPROVE->DECLINE', count: r.transitions['APPROVE->DECLINE'] });
  });

  it('returns null when nothing tightens', () => {
    expect(riskiestTransition({ ...r, transitions: { 'DECLINE->APPROVE': 3 } })).toBeNull();
  });

  it('filters flips by transition and search text', () => {
    const declines = filterFlips(r.flips, 'APPROVE->DECLINE', '');
    expect(declines).toHaveLength(r.transitions['APPROVE->DECLINE']);
    expect(declines.every((f) => f.before === 'APPROVE' && f.after === 'DECLINE')).toBe(true);
    const byCode = filterFlips(r.flips, 'ALL', 'r04');
    expect(byCode.length).toBeGreaterThan(0);
    expect(byCode.every((f) => f.newReasonCodes.includes('R04'))).toBe(true);
  });

  it('marks the pipeline degraded above a 10% error rate', () => {
    expect(pipelineHealth({ applied: 90, duplicates: 5, rejected: 5, transientFailures: 0 }).status).toBe('healthy');
    expect(pipelineHealth({ applied: 80, duplicates: 0, rejected: 15, transientFailures: 5 }).status).toBe('degraded');
  });
});
