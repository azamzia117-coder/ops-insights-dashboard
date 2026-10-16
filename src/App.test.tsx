import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import report from './fixtures/impact-report.json';
import stats from './fixtures/pipeline-stats.json';
import type { ImpactReport, PipelineStats } from './lib/types';

const loadStats = () => Promise.resolve({ data: stats as PipelineStats, source: 'sample' as const });
const loadReport = () => Promise.resolve({ data: report as ImpactReport, source: 'sample' as const });

describe('App', () => {
  it('renders pipeline health and rule-change impact from sample data', async () => {
    render(<App loadStats={loadStats} loadReport={loadReport} />);

    expect(await screen.findByText('Ops Insights')).toBeInTheDocument();
    expect(screen.getByText('Showing synthetic sample data')).toBeInTheDocument();
    expect(screen.getByText('Rule change impact: 2026.1 → 2026.2')).toBeInTheDocument();
    expect(screen.getByText(String((report as ImpactReport).flips.length))).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength((report as ImpactReport).flips.length + 1);
  });

  it('filters the changed-decisions table', async () => {
    const user = userEvent.setup();
    render(<App loadStats={loadStats} loadReport={loadReport} />);
    const table = await screen.findByRole('table');

    await user.selectOptions(screen.getByLabelText(/Transition/), 'REFER->DECLINE');
    const expected = (report as ImpactReport).transitions['REFER->DECLINE'];
    expect(within(table).getAllByRole('row')).toHaveLength(expected + 1);

    await user.type(screen.getByLabelText(/Search/), 'no-such-applicant');
    expect(screen.getByText('No changed decisions match these filters.')).toBeInTheDocument();
  });
});
