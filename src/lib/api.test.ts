import { describe, expect, it, vi } from 'vitest';
import { loadImpact, loadPipelineStats } from './api';

describe('api loaders', () => {
  it('uses bundled samples when no base URL is configured', async () => {
    const fetcher = vi.fn();
    const result = await loadPipelineStats(undefined, fetcher);
    expect(result.source).toBe('sample');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('calls the live endpoint and returns its data', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ applied: 1, duplicates: 0, rejected: 0, transientFailures: 0 }), { status: 200 }),
    );
    const result = await loadPipelineStats('http://localhost:8080/', fetcher);
    expect(fetcher).toHaveBeenCalledWith('http://localhost:8080/api/pipeline/stats', expect.anything());
    expect(result).toEqual({ source: 'live', data: { applied: 1, duplicates: 0, rejected: 0, transientFailures: 0 } });
  });

  it('falls back to samples and reports the error when the service fails', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('nope', { status: 503 }));
    const result = await loadImpact('2026.2', 'http://localhost:8082', fetcher);
    expect(fetcher).toHaveBeenCalledWith('http://localhost:8082/api/rulesets/impact?candidate=2026.2', expect.anything());
    expect(result.source).toBe('sample');
    expect(result.error).toBe('HTTP 503');
  });
});
