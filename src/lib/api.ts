import impactFixture from '../fixtures/impact-report.json';
import statsFixture from '../fixtures/pipeline-stats.json';
import type { ImpactReport, PipelineStats } from './types';

export interface Loaded<T> {
  data: T;
  source: 'live' | 'sample';
  error?: string;
}

/**
 * Fetches from the backing services when their base URL is configured; otherwise (or on failure)
 * falls back to bundled synthetic samples so the dashboard always renders.
 */
async function loadJson<T>(baseUrl: string | undefined, path: string, fallback: T, fetcher: typeof fetch): Promise<Loaded<T>> {
  if (!baseUrl) return { data: fallback, source: 'sample' };
  try {
    const res = await fetcher(`${baseUrl.replace(/\/$/, '')}${path}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: (await res.json()) as T, source: 'live' };
  } catch (e) {
    return { data: fallback, source: 'sample', error: e instanceof Error ? e.message : String(e) };
  }
}

export function loadPipelineStats(baseUrl = import.meta.env.VITE_PIPELINE_API, fetcher: typeof fetch = fetch) {
  return loadJson<PipelineStats>(baseUrl, '/api/pipeline/stats', statsFixture as PipelineStats, fetcher);
}

export function loadImpact(candidate: string, baseUrl = import.meta.env.VITE_DECISIONING_API, fetcher: typeof fetch = fetch) {
  return loadJson<ImpactReport>(
    baseUrl,
    `/api/rulesets/impact?candidate=${encodeURIComponent(candidate)}`,
    impactFixture as ImpactReport,
    fetcher,
  );
}
