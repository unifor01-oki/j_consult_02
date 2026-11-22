import React from 'react';
import { CRITERIA, ScoreMap, calculateItemScore } from '../data/evaluationData';

interface RadarChartProps {
  scores: ScoreMap;
  accentColor: string;
  activeKey: string | null;
  onSelectAxis?: (key: (typeof CRITERIA)[number]['key']) => void;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  scores,
  accentColor,
  activeKey,
  onSelectAxis,
}) => {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const maxRadius = 86;
  const levels = [1, 2, 3, 4, 5];

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / CRITERIA.length - Math.PI / 2;
    const radius = (value / 5) * maxRadius;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const buildPolygonPoints = (values: number[]) =>
    values
      .map((val, idx) => {
        const pt = getPoint(idx, val);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');

  const currentValues = CRITERIA.map((c) => scores[c.key]);
  const baselineValues = CRITERIA.map(() => 3);

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[272px] overflow-visible"
        role="img"
        aria-label="5개 입지 평가 항목 균형 방사형 차트"
      >
        {/* Concentric pentagon grid rings (1..5) */}
        {levels.map((level) => (
          <polygon
            key={level}
            points={buildPolygonPoints(CRITERIA.map(() => level))}
            fill="none"
            stroke={level === 3 ? '#CBD5E1' : '#E2E8F0'}
            strokeWidth={level === 3 ? '1.25' : '1'}
            strokeDasharray={level === 3 ? '3 3' : undefined}
          />
        ))}

        {/* Axis spokes */}
        {CRITERIA.map((item, idx) => {
          const outer = getPoint(idx, 5);
          const isFocused = activeKey === item.key;
          return (
            <line
              key={item.key}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke={isFocused ? accentColor : '#E2E8F0'}
              strokeWidth={isFocused ? '1.5' : '1'}
            />
          );
        })}

        {/* Baseline 3-point reference polygon */}
        <polygon
          points={buildPolygonPoints(baselineValues)}
          fill="#94A3B8"
          fillOpacity="0.08"
          stroke="#94A3B8"
          strokeWidth="1.25"
          strokeDasharray="4 3"
        />

        {/* Current evaluation polygon */}
        <polygon
          points={buildPolygonPoints(currentValues)}
          fill={accentColor}
          fillOpacity="0.16"
          stroke={accentColor}
          strokeWidth="2.25"
          strokeLinejoin="round"
        />

        {/* Scale ring numbers on top axis */}
        {[1, 3, 5].map((lv) => {
          const pt = getPoint(0, lv);
          return (
            <text
              key={lv}
              x={pt.x + 8}
              y={pt.y + 3}
              className="fill-[#94A3B8] font-mono text-[9px] tabular-nums"
            >
              {lv}
            </text>
          );
        })}

        {/* Vertex dots and clickable axis labels */}
        {CRITERIA.map((item, idx) => {
          const val = scores[item.key];
          const pt = getPoint(idx, val);
          const labelPt = getPoint(idx, 6.25);
          const weighted = calculateItemScore(val, item.weight);
          const isFocused = activeKey === item.key;

          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (labelPt.x < cx - 18) textAnchor = 'end';
          else if (labelPt.x > cx + 18) textAnchor = 'start';

          const yOffset = idx === 0 ? -4 : idx === 2 || idx === 3 ? 8 : 2;

          return (
            <g
              key={item.key}
              onClick={() => onSelectAxis?.(item.key)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isFocused ? '5.5' : '4'}
                fill="#FFFFFF"
                stroke={accentColor}
                strokeWidth="2.5"
              />
              <text
                x={labelPt.x}
                y={labelPt.y + yOffset}
                textAnchor={textAnchor}
                className={`text-[11px] font-medium transition-colors ${
                  isFocused ? 'fill-[#0F172A] font-semibold' : 'fill-[#334155]'
                }`}
              >
                {item.shortName}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + yOffset + 13}
                textAnchor={textAnchor}
                className="fill-[#64748B] font-mono text-[10px] tabular-nums"
              >
                {val}점 ({weighted}/{item.weight})
              </text>
            </g>
          );
        })}
      </svg>

      {/* Quiet unboxed legend */}
      <div className="mt-2 flex items-center justify-center gap-5 text-[11px] text-[#64748B]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-0.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          현재 평가 프로파일
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 border-t border-dashed border-[#94A3B8]" />
          기본 기준선 (3점 · 60점)
        </span>
      </div>
    </div>
  );
};
