import { useEffect, useState } from 'react';
import { FlipsTable } from './components/FlipsTable';
import { OutcomeBars } from './components/OutcomeBars';
import { StatCard } from './components/StatCard';
import { loadImpact, loadPipelineStats, type Loaded } from './lib/api';
import { outcomeDeltas, pct, pipelineHealth, riskiestTransition } from './lib/impact';
import type { ImpactReport, PipelineStats } from './lib/types';

interface Props {
  loadStats?: () => Promise<Loaded<PipelineStats>>;
  loadReport?: () => Promise<Loaded<ImpactReport>>;
}

const defaultLoadStats = () => loadPipelineStats();
const defaultLoadReport = () => loadImpact('2026.2');

export default function App({ loadStats = defaultLoadStats, loadReport = defaultLoadReport }: Props) {
  const [stats, setStats] = useState<Loaded<PipelineStats> | null>(null);
  const [report, setReport] = useState<Loaded<ImpactReport> | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadStats(), loadReport()]).then(([s, r]) => {
      if (!cancelled) {
        setStats(s);
        setReport(r);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadStats, loadReport]);

  if (!stats || !report) return <p className="loading">Loading…</p>;

  const health = pipelineHealth(stats.data);
  const r = report.data;
  const changed = r.flips.length;
  const riskiest = riskiestTransition(r);
  const usingSamples = stats.source === 'sample' || report.source === 'sample';

  return (
    <main className="layout">
      <header className="header">
        <h1>Ops Insights</h1>
        {usingSamples && <span className="badge">Showing synthetic sample data</span>}
      </header>

      <h2 className="section">Payment event pipeline</h2>
      <div className="grid">
        <StatCard label="Events applied" value={stats.data.applied} />
        <StatCard label="Duplicates ignored" value={stats.data.duplicates} hint="Redeliveries absorbed by idempotency" />
        <StatCard label="Rejected to DLT" value={stats.data.rejected} tone={stats.data.rejected > 0 ? 'warn' : 'good'} />
        <StatCard label="Status" value={health.status} hint={`Error rate ${health.errorRate}`} tone={health.status === 'healthy' ? 'good' : 'warn'} />
      </div>

      <h2 className="section">
        Rule change impact: {r.baselineVersion} → {r.candidateVersion}
      </h2>
      <div className="grid">
        <StatCard label="Applications replayed" value={r.applications} />
        <StatCard label="Decisions changed" value={changed} hint={pct(changed, r.applications)} tone={changed > 0 ? 'warn' : 'good'} />
        <StatCard
          label="Largest tightening"
          value={riskiest ? riskiest.key : 'None'}
          hint={riskiest ? `${riskiest.count} applications` : undefined}
          tone={riskiest ? 'warn' : 'good'}
        />
      </div>
      <OutcomeBars deltas={outcomeDeltas(r)} total={r.applications} baselineLabel={r.baselineVersion} candidateLabel={r.candidateVersion} />
      <FlipsTable flips={r.flips} transitions={r.transitions} />
    </main>
  );
}
