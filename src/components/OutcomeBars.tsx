import type { OutcomeDelta } from '../lib/impact';

interface Props {
  deltas: OutcomeDelta[];
  total: number;
  baselineLabel: string;
  candidateLabel: string;
}

/** Paired horizontal bars (baseline vs candidate) drawn as plain SVG to keep the bundle small. */
export function OutcomeBars({ deltas, total, baselineLabel, candidateLabel }: Props) {
  const width = 320;
  const rowHeight = 46;
  const scale = (n: number) => (total === 0 ? 0 : (n / total) * width);
  return (
    <figure className="card">
      <figcaption className="card__title">Outcome mix: {baselineLabel} vs {candidateLabel}</figcaption>
      <svg role="img" aria-label="Outcome counts by rule set" viewBox={`0 0 ${width + 150} ${deltas.length * rowHeight}`} width={width + 150} className="bars">
        {deltas.map((d, i) => (
          <g key={d.outcome} transform={`translate(0, ${i * rowHeight})`}>
            <text x="0" y="16" className="bars__label">{d.outcome}</text>
            <rect x="80" y="4" height="14" width={scale(d.before)} className="bars__baseline" />
            <rect x="80" y="22" height="14" width={scale(d.after)} className="bars__candidate" />
            <text x={86 + Math.max(scale(d.before), scale(d.after))} y="24" className="bars__value">
              {d.before} → {d.after} ({d.delta >= 0 ? '+' : ''}{d.delta})
            </text>
          </g>
        ))}
      </svg>
      <div className="legend">
        <span className="legend__swatch bars__baseline" /> {baselineLabel}
        <span className="legend__swatch bars__candidate" /> {candidateLabel}
      </div>
    </figure>
  );
}
