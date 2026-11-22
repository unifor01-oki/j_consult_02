import React from 'react';
import { ScoreTier } from '../data/evaluationData';

interface ScoreGaugeProps {
  score: number;
  tier: ScoreTier;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, tier }) => {
  // Semicircular gauge from 180deg (left, 0) to 0deg (right, 100)
  const cx = 140;
  const cy = 128;
  const r = 98;
  const clamped = Math.max(0, Math.min(100, score));

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY - radius * Math.sin(rad),
    };
  };

  // Arc from 180deg down to target angle
  const describeArc = (startScore: number, endScore: number) => {
    const startAngle = 180 - (startScore / 100) * 180;
    const endAngle = 180 - (endScore / 100) * 180;
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = Math.abs(endScore - startScore) > 50 ? 1 : 0;
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  const markerAngle = 180 - (clamped / 100) * 180;
  const markerPos = polarToCartesian(cx, cy, r, markerAngle);

  const ticks = [0, 20, 40, 60, 80, 100];

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 280 156"
        className="w-full max-w-[280px] overflow-visible"
        role="img"
        aria-label={`종합 입지 평가 점수 100점 만점에 ${score}점, 해석: ${tier.label}`}
      >
        {/* Background track */}
        <path
          d={describeArc(0, 100)}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Subtle threshold markers at 40, 60, 80 */}
        {[40, 60, 80].map((val) => {
          const angle = 180 - (val / 100) * 180;
          const inner = polarToCartesian(cx, cy, r - 10, angle);
          const outer = polarToCartesian(cx, cy, r + 10, angle);
          return (
            <line
              key={val}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          );
        })}

        {/* Active value arc */}
        {clamped > 0 && (
          <path
            d={describeArc(0, clamped)}
            fill="none"
            stroke={tier.accentColor}
            strokeWidth="14"
            strokeLinecap="round"
            style={{
              transition: 'stroke 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        )}

        {/* Scale tick numbers */}
        {ticks.map((val) => {
          const angle = 180 - (val / 100) * 180;
          const labelPos = polarToCartesian(cx, cy, r + 24, angle);
          return (
            <text
              key={val}
              x={labelPos.x}
              y={labelPos.y + 4}
              textAnchor="middle"
              className="fill-[#64748B] font-mono text-[10px] tabular-nums"
            >
              {val}
            </text>
          );
        })}

        {/* Current score thumb indicator */}
        <circle
          cx={markerPos.x}
          cy={markerPos.y}
          r="7.5"
          fill="#FFFFFF"
          stroke={tier.accentColor}
          strokeWidth="3.5"
        />

        {/* Center numeric readout */}
        <text
          x={cx}
          y={cy - 18}
          textAnchor="middle"
          className="fill-[#0F172A] font-mono text-[44px] font-semibold tracking-tight tabular-nums"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          className="fill-[#64748B] text-[12px] font-medium"
        >
          / 100점 만점
        </text>
      </svg>
    </div>
  );
};
