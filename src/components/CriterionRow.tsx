import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  CriterionConfig,
  SCORE_LEVEL_LABELS,
  ScoreValue,
  calculateItemScore,
} from '../data/evaluationData';

interface CriterionRowProps {
  criterion: CriterionConfig;
  score: ScoreValue;
  isHighlighted: boolean;
  isExpanded: boolean;
  onScoreChange: (value: ScoreValue) => void;
  onToggleExpand: () => void;
  onFocusRow: () => void;
}

const SCORE_OPTIONS: ScoreValue[] = [1, 2, 3, 4, 5];

export const CriterionRow: React.FC<CriterionRowProps> = ({
  criterion,
  score,
  isHighlighted,
  isExpanded,
  onScoreChange,
  onToggleExpand,
  onFocusRow,
}) => {
  const weightedScore = calculateItemScore(score, criterion.weight);
  const fillPercent = ((score - 1) / 4) * 100;

  return (
    <div
      id={`criterion-${criterion.key}`}
      onMouseEnter={onFocusRow}
      className={`px-6 py-5 transition-colors duration-150 ${
        isHighlighted ? 'bg-[#F8FAFC]' : 'bg-white'
      }`}
    >
      {/* Top Row: Index + Title + Weight vs Live Calculated Points */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="font-mono text-xs font-medium text-[#64748B] tabular-nums">
            {criterion.indexLabel}.
          </span>
          <h3 className="text-base font-semibold text-[#0F172A] tracking-tight">
            {criterion.name}
          </h3>
          <span className="text-xs text-[#64748B]" aria-hidden="true">
            ·
          </span>
          <span className="text-xs font-medium text-[#475569] tabular-nums">
            배점 {criterion.weight}점
          </span>
        </div>

        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-xs text-[#64748B] tabular-nums">
            {score} ÷ 5 × {criterion.weight} =
          </span>
          <span className="font-mono text-lg font-semibold text-[#0F172A] tabular-nums">
            {weightedScore}
            <span className="ml-0.5 text-xs font-normal text-[#64748B]">
              / {criterion.weight}점
            </span>
          </span>
        </div>
      </div>

      {/* Brief definition line */}
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#475569]">
        {criterion.summary}
      </p>

      {/* Interactive 1~5 Discrete Score Selector */}
      <div
        className="mt-4 grid grid-cols-5 gap-2"
        role="radiogroup"
        aria-label={`${criterion.name} 점수 선택 (1~5점)`}
      >
        {SCORE_OPTIONS.map((option) => {
          const isSelected = score === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onScoreChange(option)}
              className={`group flex flex-col items-center justify-center min-h-[48px] px-2 py-2 rounded-lg border text-center transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] cursor-pointer ${
                isSelected
                  ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white shadow-xs'
                  : 'bg-white border-[#E2E8F0] text-[#334155] hover:border-[#94A3B8] hover:bg-[#F8FAFC]'
              }`}
            >
              <span className="font-mono text-sm font-semibold leading-none tabular-nums">
                {option}점
              </span>
              <span
                className={`mt-1 text-[11px] leading-none whitespace-nowrap ${
                  isSelected ? 'text-white/90' : 'text-[#64748B]'
                }`}
              >
                {SCORE_LEVEL_LABELS[option]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Synced Range Slider with accessible label & value */}
      <div className="mt-3.5 flex items-center gap-3">
        <label
          htmlFor={`slider-${criterion.key}`}
          className="sr-only"
        >
          {criterion.name} 슬라이더 (현재 {score}점)
        </label>
        <span className="font-mono text-[11px] text-[#94A3B8] tabular-nums select-none">
          1
        </span>
        <input
          id={`slider-${criterion.key}`}
          type="range"
          min={1}
          max={5}
          step={1}
          value={score}
          onChange={(e) => onScoreChange(Number(e.target.value) as ScoreValue)}
          className="rubric-slider w-full"
          style={{
            background: `linear-gradient(to right, #1D4ED8 0%, #1D4ED8 ${fillPercent}%, #E2E8F0 ${fillPercent}%, #E2E8F0 100%)`,
          }}
        />
        <span className="font-mono text-[11px] text-[#94A3B8] tabular-nums select-none">
          5
        </span>
      </div>

      {/* Live level descriptor + expandable field checkpoints */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs leading-relaxed text-[#334155] flex-1 min-w-[220px]">
          <span className="font-semibold text-[#1D4ED8] tabular-nums">
            {score}점 기준 ({SCORE_LEVEL_LABELS[score]}):
          </span>{' '}
          {criterion.levelDescriptions[score]}
        </p>

        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer"
        >
          <span>현장 점검 포인트</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isExpanded && (
        <ul className="mt-3 pt-3 border-t border-[#F1F5F9] space-y-1.5 text-xs text-[#475569]">
          {criterion.checkpoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="font-mono text-[11px] text-[#94A3B8] select-none mt-0.5">
                {idx + 1}.
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
