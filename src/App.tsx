import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookmarkPlus,
  Check,
  CheckCircle2,
  Copy,
  PauseCircle,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  CRITERIA,
  CriterionKey,
  DEFAULT_SCORES,
  PRESET_SCENARIOS,
  SCORE_LEVEL_LABELS,
  SCORE_TIERS,
  SavedCandidate,
  ScoreMap,
  ScoreTier,
  ScoreValue,
  calculateItemScore,
  calculateTotalScore,
  getInterpretation,
} from './data/evaluationData';
import { CriterionRow } from './components/CriterionRow';
import { ScoreGauge } from './components/ScoreGauge';
import { RadarChart } from './components/RadarChart';

function renderTierIcon(tierId: ScoreTier['id'], className = 'w-5 h-5') {
  switch (tierId) {
    case 'recommend':
      return <CheckCircle2 className={className} aria-hidden="true" />;
    case 'caution':
      return <AlertTriangle className={className} aria-hidden="true" />;
    case 'hold':
      return <PauseCircle className={className} aria-hidden="true" />;
    case 'avoid':
      return <XCircle className={className} aria-hidden="true" />;
  }
}

export default function App() {
  const [scores, setScores] = useState<ScoreMap>({ ...DEFAULT_SCORES });
  const [siteName, setSiteName] = useState<string>('');
  const [siteMemo, setSiteMemo] = useState<string>('');
  const [activeKey, setActiveKey] = useState<CriterionKey | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Record<CriterionKey, boolean>>({
    demand: false,
    competition: false,
    accessibility: false,
    profitability: false,
    logistics: false,
  });
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const totalScore = useMemo(() => calculateTotalScore(scores), [scores]);
  const currentTier = useMemo(() => getInterpretation(totalScore), [totalScore]);

  const isDefaultState = useMemo(
    () => CRITERIA.every((c) => scores[c.key] === DEFAULT_SCORES[c.key]),
    [scores]
  );

  // Identify strongest and weakest dimensions for actionable diagnostic insight
  const diagnosticSummary = useMemo(() => {
    const entries = CRITERIA.map((c) => ({
      criterion: c,
      raw: scores[c.key],
      weighted: calculateItemScore(scores[c.key], c.weight),
      gap: c.weight - calculateItemScore(scores[c.key], c.weight),
    }));

    const maxRaw = Math.max(...entries.map((e) => e.raw));
    const minRaw = Math.min(...entries.map((e) => e.raw));

    const strengths = entries.filter((e) => e.raw === maxRaw && e.raw >= 4);
    const priorities = entries
      .filter((e) => e.raw === minRaw && e.raw <= 3)
      .sort((a, b) => b.gap - a.gap);

    const isUniform = maxRaw === minRaw;
    return { entries, strengths, priorities, isUniform, maxRaw, minRaw };
  }, [scores]);

  const showTransientFeedback = (message: string) => {
    setFeedbackMessage(message);
    window.setTimeout(() => {
      setFeedbackMessage((prev) => (prev === message ? null : prev));
    }, 2200);
  };

  const handleScoreChange = (key: CriterionKey, value: ScoreValue) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    setActiveKey(key);
  };

  const handleReset = () => {
    setScores({ ...DEFAULT_SCORES });
    setActiveKey(null);
    showTransientFeedback('모든 항목이 기본값(각 3점 · 합계 60점)으로 초기화되었습니다.');
  };

  const handleApplyPreset = (presetScores: ScoreMap, presetName: string) => {
    setScores({ ...presetScores });
    setActiveKey(null);
    showTransientFeedback(`‘${presetName}’ 시나리오 점수를 적용했습니다.`);
  };

  const handleToggleExpand = (key: CriterionKey) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRadarSelect = (key: CriterionKey) => {
    setActiveKey(key);
    const el = document.getElementById(`criterion-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveCandidate = () => {
    const label =
      siteName.trim() || `후보지 ${savedCandidates.length + 1}`;
    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newItem: SavedCandidate = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: label,
      memo: siteMemo.trim(),
      scores: { ...scores },
      totalScore,
      tierLabel: currentTier.label,
      createdAt: timeLabel,
    };

    setSavedCandidates((prev) => [newItem, ...prev]);
    setSiteName('');
    setSiteMemo('');
    showTransientFeedback(`‘${label}’ (${totalScore}점)을 후보지 비교 목록에 추가했습니다.`);
  };

  const handleLoadCandidate = (candidate: SavedCandidate) => {
    setScores({ ...candidate.scores });
    setSiteName(candidate.name);
    setSiteMemo(candidate.memo);
    showTransientFeedback(`‘${candidate.name}’ 점수를 시뮬레이터로 불러왔습니다.`);
    const el = document.getElementById('evaluator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDeleteCandidate = (id: string) => {
    setSavedCandidates((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCopyReport = async () => {
    const title = siteName.trim() ? `후보지: ${siteName.trim()}` : '후보지: 미지정 입지';
    const lines = [
      '[창업 입지 평가 시뮬레이터 — 출점 가능성 평가표]',
      title,
      ...(siteMemo.trim() ? [`메모: ${siteMemo.trim()}`] : []),
      '',
      ...CRITERIA.map((c) => {
        const s = scores[c.key];
        const w = calculateItemScore(s, c.weight);
        return `- ${c.name} (배점 ${c.weight}점): ${s}점(${SCORE_LEVEL_LABELS[s]}) → ${s} ÷ 5 × ${c.weight} = ${w}점`;
      }),
      '',
      `총점: ${totalScore} / 100점`,
      `판정 해석: ${currentTier.label} (${currentTier.rangeLabel})`,
      `권고 사항: ${currentTier.actionGuide}`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedReport(true);
      window.setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      showTransientFeedback('클립보드 복사를 지원하지 않는 환경입니다.');
    }
  };

  const formulaParts = CRITERIA.map((c) => calculateItemScore(scores[c.key], c.weight));

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A] flex flex-col">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Title */}
          <a
            href="#evaluator"
            className="text-[16px] font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0"
          >
            창업 입지 평가 시뮬레이터
          </a>

          {/* Zone 2: 4 Concise Single-Line Nav Links */}
          <nav
            aria-label="주요 섹션 이동"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475569]"
          >
            <a
              href="#evaluator"
              className="hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0"
            >
              평가 입력
            </a>
            <a
              href="#breakdown"
              className="hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0"
            >
              항목별 산출
            </a>
            <a
              href="#criteria"
              className="hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0"
            >
              판정 기준표
            </a>
            <a
              href="#compare"
              className="hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0"
            >
              후보지 비교
              {savedCandidates.length > 0 && (
                <span className="ml-1 font-mono text-xs text-[#1D4ED8] tabular-nums">
                  ({savedCandidates.length})
                </span>
              )}
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>기본값 초기화</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-8 py-8 sm:py-10 space-y-12">
        {/* Compact Editorial Hero & Scenario Preset Toolbar */}
        <section id="evaluator" className="scroll-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
            <div className="max-w-2xl">
              {/* Quiet Unboxed Metadata Kicker (Zero-Pill Discipline) */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#64748B]">
                <span>P02</span>
                <span aria-hidden="true">·</span>
                <span>교재 14-5. 출점 가능성 평가표</span>
                <span aria-hidden="true">·</span>
                <span>89쪽</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px]">/tools/02-location-score/</span>
              </div>

              <h1 className="mt-2.5 text-2xl sm:text-[32px] font-bold tracking-tight text-[#0F172A] leading-tight text-balance">
                출점 가능성 가중치 평가 시뮬레이터
              </h1>

              <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#475569]">
                고객 수요·경쟁 환경·입지 접근성·수익성·공급물류 5개 항목에 1~5점을 입력하면
                항목별 배점(<span className="font-mono text-[13px] text-[#0F172A] tabular-nums">25·20·20·25·10</span>)을
                반영한 총점과 출점 해석을 즉시 산출합니다.
              </p>
            </div>

            {/* Transient Status Feedback Line (accessible live region) */}
            <div
              aria-live="polite"
              className="min-h-[24px] flex items-center lg:justify-end"
            >
              {feedbackMessage && (
                <p className="text-xs font-medium text-[#1D4ED8] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{feedbackMessage}</span>
                </p>
              )}
            </div>
          </div>

          {/* Interactive Scenario Preset Controls */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#64748B] mr-1">
              빠른 예시 적용:
            </span>
            {PRESET_SCENARIOS.map((preset) => {
              const isMatch = CRITERIA.every(
                (c) => scores[c.key] === preset.scores[c.key]
              );
              const presetTotal = calculateTotalScore(preset.scores);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.scores, preset.name)}
                  title={preset.description}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                    isMatch
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-[#334155] border-[#E2E8F0] hover:border-[#94A3B8] hover:text-[#0F172A]'
                  }`}
                >
                  <span>{preset.name}</span>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      isMatch ? 'text-white/80' : 'text-[#64748B]'
                    }`}
                  >
                    {presetTotal}점
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main 2-Zone Sandbox Split: Left 5-Criteria Input Deck / Right Sticky Evaluation Stage */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* LEFT ZONE (7 cols): 5 Evaluation Criteria Rubric Deck */}
            <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              {/* Surface Header */}
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-[#FAFBFD]">
                <div>
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    평가 항목별 점수 입력 (1~5점)
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    산출식: <span className="font-mono text-[#334155]">항목 점수 ÷ 5 × 배점</span> · 기본값 각 3점
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#64748B] tabular-nums">
                    배점 합계 <strong className="font-mono text-[#0F172A]">100</strong>점
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isDefaultState}
                    className={`inline-flex items-center gap-1 font-medium whitespace-nowrap transition-colors ${
                      isDefaultState
                        ? 'text-[#94A3B8] cursor-not-allowed'
                        : 'text-[#1D4ED8] hover:text-[#1E40AF] cursor-pointer'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>각 3점으로 재설정</span>
                  </button>
                </div>
              </div>

              {/* 5 Criteria separated by clean hairline dividers (No cards-within-cards) */}
              <div className="divide-y divide-[#E2E8F0]">
                {CRITERIA.map((criterion) => (
                  <CriterionRow
                    key={criterion.key}
                    criterion={criterion}
                    score={scores[criterion.key]}
                    isHighlighted={activeKey === criterion.key}
                    isExpanded={expandedKeys[criterion.key]}
                    onScoreChange={(val) => handleScoreChange(criterion.key, val)}
                    onToggleExpand={() => handleToggleExpand(criterion.key)}
                    onFocusRow={() => setActiveKey(criterion.key)}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT ZONE (5 cols): Live Score, Interpretation, Radar & Actions */}
            <aside className="lg:col-span-5 lg:sticky lg:top-20 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
              {/* Primary Focal Anchor: Score Gauge + Interpretation Verdict */}
              <div className="p-6 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    종합 평가 결과
                  </h2>
                  <span className="font-mono text-xs text-[#64748B] tabular-nums">
                    {currentTier.rangeLabel}
                  </span>
                </div>

                <ScoreGauge score={totalScore} tier={currentTier} />

                {/* Dual-coded Interpretation Callout (Clean surface contrast, no thick left border) */}
                <div
                  className={`mt-3 p-4 rounded-lg border ${currentTier.bgTintClass} ${currentTier.borderClass}`}
                >
                  <div className={`flex items-center gap-2 ${currentTier.textClass}`}>
                    {renderTierIcon(currentTier.id, 'w-5 h-5 shrink-0')}
                    <span className="text-lg font-bold tracking-tight">
                      {currentTier.label}
                    </span>
                    <span className="text-xs font-medium opacity-80 ml-auto">
                      {currentTier.shortStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#334155]">
                    {currentTier.summary}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                    <span className="font-semibold text-[#0F172A]">권장 조치:</span>{' '}
                    {currentTier.actionGuide}
                  </p>
                </div>

                {/* Live Formula Summation Strip */}
                <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>가중 합산식</span>
                    <span className="font-mono text-[#0F172A] font-medium tabular-nums">
                      {formulaParts.join(' + ')} = {totalScore}점
                    </span>
                  </div>

                  {/* Proportional 100-Point Stacked Bar */}
                  <div
                    className="mt-2.5 h-2.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden flex"
                    aria-label="100점 기준 항목별 기여도 막대"
                  >
                    {CRITERIA.map((item) => {
                      const pts = calculateItemScore(scores[item.key], item.weight);
                      return (
                        <div
                          key={item.key}
                          style={{
                            width: `${pts}%`,
                            backgroundColor: item.barColor,
                            transition: 'width 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                          title={`${item.name}: ${pts}점 / ${item.weight}점`}
                        />
                      );
                    })}
                  </div>

                  {/* Compact Legend for Stacked Bar */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-[#64748B] tabular-nums">
                    {CRITERIA.map((item) => {
                      const pts = calculateItemScore(scores[item.key], item.weight);
                      return (
                        <span key={item.key} className="inline-flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-xs shrink-0"
                            style={{ backgroundColor: item.barColor }}
                          />
                          <span>{item.shortName}</span>
                          <span className="font-mono text-[#0F172A]">{pts}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5-Axis Radar Chart + Auto Diagnostic Note */}
              <div className="p-6 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-[#0F172A]">
                    5대 항목 균형 프로파일
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    축 클릭 시 항목 이동
                  </span>
                </div>

                <RadarChart
                  scores={scores}
                  accentColor={currentTier.accentColor}
                  activeKey={activeKey}
                  onSelectAxis={handleRadarSelect}
                />

                {/* Contextual Strength / Priority Callout */}
                <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] text-xs space-y-1.5 text-[#475569]">
                  {diagnosticSummary.isUniform ? (
                    <p className="leading-relaxed">
                      5개 항목이 모두{' '}
                      <strong className="font-mono text-[#0F172A] tabular-nums">
                        {diagnosticSummary.maxRaw}점
                      </strong>
                      으로 균일합니다. 실제 후보지 실사 결과를 반영해 취약 항목과 강점 항목을 구분해 보세요.
                    </p>
                  ) : (
                    <>
                      {diagnosticSummary.strengths.length > 0 && (
                        <p className="leading-relaxed">
                          <span className="font-semibold text-[#047857]">강점 항목:</span>{' '}
                          {diagnosticSummary.strengths
                            .map((s) => `${s.criterion.name}(${s.raw}점)`)
                            .join(', ')}
                        </p>
                      )}
                      {diagnosticSummary.priorities.length > 0 && (
                        <p className="leading-relaxed">
                          <span className="font-semibold text-[#B45309]">우선 보완 항목:</span>{' '}
                          {diagnosticSummary.priorities
                            .map(
                              (p) =>
                                `${p.criterion.name}(${p.raw}점 · 잔여 배점 ${p.gap}점)`
                            )
                            .join(', ')}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Save to Candidate Comparison & Copy Report */}
              <div className="p-6 bg-[#FAFBFD] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="site-name-input" className="sr-only">
                      후보지 명칭
                    </label>
                    <input
                      id="site-name-input"
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="후보지명 (예: A상권 1층 코너)"
                      maxLength={40}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="site-memo-input" className="sr-only">
                      간단 메모
                    </label>
                    <input
                      id="site-memo-input"
                      type="text"
                      value={siteMemo}
                      onChange={(e) => setSiteMemo(e.target.value)}
                      placeholder="메모 (예: 월세 280만원, 역 도보 3분)"
                      maxLength={60}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveCandidate}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                  >
                    <BookmarkPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>후보지 비교함에 저장</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#334155] bg-white border border-[#CBD5E1] rounded-lg hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                  >
                    {copiedReport ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#047857]" aria-hidden="true" />
                        <span className="text-[#047857]">요약 복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>결과 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* SECTION 2: Weighted Breakdown Table */}
        <section id="breakdown" className="scroll-mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">
                01. 항목별 가중치 및 점수 산출 내역
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                각 항목은 5점 만점 평가 점수를 배점 비율로 환산하여 총 100점 만점으로 합산합니다.
              </p>
            </div>
            <span className="font-mono text-xs text-[#475569] tabular-nums">
              현재 합계 {totalScore} / 100점
            </span>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FAFBFD] text-xs font-semibold text-[#475569]">
                  <th className="py-3.5 px-5">평가 항목</th>
                  <th className="py-3.5 px-4 text-right">배점</th>
                  <th className="py-3.5 px-4 text-right">입력 점수</th>
                  <th className="py-3.5 px-4">수준</th>
                  <th className="py-3.5 px-4 text-right">산출식 (점수 ÷ 5 × 배점)</th>
                  <th className="py-3.5 px-5 text-right">환산 점수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-sm">
                {CRITERIA.map((item) => {
                  const s = scores[item.key];
                  const weighted = calculateItemScore(s, item.weight);
                  const ratio = Math.round((weighted / item.weight) * 100);
                  return (
                    <tr
                      key={item.key}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3.5 px-5 font-medium text-[#0F172A]">
                        <span className="font-mono text-xs text-[#94A3B8] mr-2 tabular-nums">
                          {item.indexLabel}
                        </span>
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#475569] tabular-nums">
                        {item.weight}점
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0F172A] tabular-nums">
                        {s} / 5
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#475569]">
                        {SCORE_LEVEL_LABELS[s]}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-[#64748B] tabular-nums">
                        {s} ÷ 5 × {item.weight}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold text-[#0F172A] tabular-nums">
                        {weighted}점{' '}
                        <span className="text-xs font-normal text-[#94A3B8]">
                          ({ratio}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#CBD5E1] bg-[#FAFBFD] font-semibold text-[#0F172A]">
                  <td className="py-3.5 px-5 text-sm">합계</td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm tabular-nums">
                    100점
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-[#475569] tabular-nums">
                    평균{' '}
                    {(
                      CRITERIA.reduce((acc, c) => acc + scores[c.key], 0) /
                      CRITERIA.length
                    ).toFixed(1)}
                    점
                  </td>
                  <td className={`py-3.5 px-4 text-xs font-semibold ${currentTier.textClass}`}>
                    {currentTier.label}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-[#475569] tabular-nums">
                    {formulaParts.join(' + ')}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono text-base font-bold text-[#0F172A] tabular-nums">
                    {totalScore}점
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* SECTION 3: Score Interpretation Criteria Table */}
        <section id="criteria" className="scroll-mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">
                02. 점수 구간별 출점 판정 기준표
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                전 항목 기본 3점(60점)은 ‘신중한 검토’ 구간에 해당하며, 구간 경계는 교재 원본 규칙에 맞춰 활용할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCORE_TIERS.map((tier) => {
              const isActive = tier.id === currentTier.id;
              return (
                <div
                  key={tier.id}
                  className={`p-5 rounded-xl border transition-colors ${
                    isActive
                      ? `${tier.bgTintClass} ${tier.borderClass}`
                      : 'bg-white border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-[#0F172A] tabular-nums">
                      {tier.rangeLabel}
                    </span>
                    {isActive && (
                      <span
                        className={`text-[11px] font-semibold ${tier.textClass}`}
                      >
                        현재 판정
                      </span>
                    )}
                  </div>

                  <div className={`mt-2.5 flex items-center gap-2 ${tier.textClass}`}>
                    {renderTierIcon(tier.id, 'w-4 h-4 shrink-0')}
                    <h3 className="text-base font-bold tracking-tight">
                      {tier.label}
                    </h3>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-[#475569]">
                    {tier.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: Saved Candidate Comparison Board */}
        <section id="compare" className="scroll-mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">
                03. 후보지 시뮬레이션 비교
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                여러 후보지의 점수를 저장해 나란히 비교하고, 언제든 시뮬레이터로 다시 불러와 조건을 조정해 볼 수 있습니다.
              </p>
            </div>
            {savedCandidates.length > 0 && (
              <span className="text-xs text-[#64748B] tabular-nums">
                저장된 후보지 {savedCandidates.length}건
              </span>
            )}
          </div>

          {savedCandidates.length === 0 ? (
            <div className="bg-white border border-dashed border-[#CBD5E1] rounded-xl px-6 py-10 text-center">
              <p className="text-sm font-medium text-[#334155]">
                아직 저장된 비교 후보지가 없습니다.
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                우측 평가 결과 패널에서 후보지명을 입력하고 ‘후보지 비교함에 저장’을 누르면 이곳에 비교표가 생성됩니다.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#FAFBFD] text-xs font-semibold text-[#475569]">
                    <th className="py-3.5 px-5">후보지</th>
                    {CRITERIA.map((c) => (
                      <th key={c.key} className="py-3.5 px-3 text-right">
                        {c.shortName}
                        <span className="block font-mono font-normal text-[10px] text-[#94A3B8]">
                          ({c.weight}점)
                        </span>
                      </th>
                    ))}
                    <th className="py-3.5 px-4 text-right">총점</th>
                    <th className="py-3.5 px-4">해석</th>
                    <th className="py-3.5 px-5 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-sm">
                  {savedCandidates.map((candidate) => {
                    const tier = getInterpretation(candidate.totalScore);
                    return (
                      <tr
                        key={candidate.id}
                        className="hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-[#0F172A]">
                            {candidate.name}
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5">
                            {candidate.memo ? `${candidate.memo} · ` : ''}
                            저장 {candidate.createdAt}
                          </div>
                        </td>
                        {CRITERIA.map((c) => {
                          const raw = candidate.scores[c.key];
                          const pts = calculateItemScore(raw, c.weight);
                          return (
                            <td
                              key={c.key}
                              className="py-3.5 px-3 text-right font-mono text-xs tabular-nums"
                            >
                              <span className="text-[#0F172A] font-medium">
                                {pts}점
                              </span>
                              <span className="block text-[10px] text-[#94A3B8]">
                                ({raw}/5)
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-3.5 px-4 text-right font-mono text-base font-bold text-[#0F172A] tabular-nums">
                          {candidate.totalScore}점
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tier.textClass}`}
                          >
                            {renderTierIcon(tier.id, 'w-3.5 h-3.5 shrink-0')}
                            <span>{tier.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleLoadCandidate(candidate)}
                              className="inline-flex items-center gap-0.5 text-xs font-medium text-[#1D4ED8] hover:text-[#1E40AF] whitespace-nowrap cursor-pointer"
                            >
                              <span>불러오기</span>
                              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCandidate(candidate.id)}
                              aria-label={`${candidate.name} 삭제`}
                              className="text-[#94A3B8] hover:text-[#BE123C] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-12 border-t border-[#E2E8F0] bg-white">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#64748B]">
          <div>
            P02 창업 입지 평가 시뮬레이터 · 교재 14-5. 출점 가능성 평가표 (89쪽)
          </div>
          <div className="font-mono text-[11px] text-[#94A3B8] tabular-nums">
            배점 구성: 고객 수요 25 · 경쟁 환경 20 · 입지 접근성 20 · 수익성 25 · 공급물류 10
          </div>
        </div>
      </footer>
    </div>
  );
}
