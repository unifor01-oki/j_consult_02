export type CriterionKey =
  | 'demand'
  | 'competition'
  | 'accessibility'
  | 'profitability'
  | 'logistics';

export type ScoreValue = 1 | 2 | 3 | 4 | 5;

export type ScoreMap = Record<CriterionKey, ScoreValue>;

export interface CriterionConfig {
  key: CriterionKey;
  indexLabel: string;
  name: string;
  shortName: string;
  weight: number;
  summary: string;
  checkpoints: string[];
  levelDescriptions: Record<ScoreValue, string>;
  barColor: string;
}

export interface ScoreTier {
  id: 'recommend' | 'caution' | 'hold' | 'avoid';
  min: number;
  max: number;
  rangeLabel: string;
  label: string;
  shortStatus: string;
  summary: string;
  actionGuide: string;
  accentColor: string;
  textClass: string;
  bgTintClass: string;
  borderClass: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  scores: ScoreMap;
}

export interface SavedCandidate {
  id: string;
  name: string;
  memo: string;
  scores: ScoreMap;
  totalScore: number;
  tierLabel: string;
  createdAt: string;
}

export const SCORE_LEVEL_LABELS: Record<ScoreValue, string> = {
  1: '매우 미흡',
  2: '미흡',
  3: '보통',
  4: '우수',
  5: '매우 우수',
};

export const DEFAULT_SCORES: ScoreMap = {
  demand: 3,
  competition: 3,
  accessibility: 3,
  profitability: 3,
  logistics: 3,
};

export const CRITERIA: CriterionConfig[] = [
  {
    key: 'demand',
    indexLabel: '01',
    name: '고객 수요',
    shortName: '고객 수요',
    weight: 25,
    summary: '핵심 타깃 고객 규모, 배후 세대·오피스 밀도, 시간대별 유동인구 안정성',
    checkpoints: [
      '반경 500m 내 주 고객층(주거·직장·학생) 규모와 소비 여력',
      '주중·주말 및 시간대별 유동인구 편차와 지속 가능성',
      '해당 업종에 대한 지역 내 반복 구매 수요와 성장 추세',
    ],
    levelDescriptions: {
      1: '유동인구와 배후 수요가 현저히 부족하여 기본 매출 확보가 어렵습니다.',
      2: '배후 수요가 제한적이거나 특정 시간대에만 유입이 편중되어 있습니다.',
      3: '평균 수준의 유동인구와 배후 세대가 형성되어 있으나 차별화 노력이 필요합니다.',
      4: '핵심 타깃 고객층이 두텁고 주중·주말 수요가 안정적으로 유지됩니다.',
      5: '풍부한 배후 수요와 높은 구매력을 갖춘 최상위 상권 수요를 보입니다.',
    },
    barColor: '#1D4ED8',
  },
  {
    key: 'competition',
    indexLabel: '02',
    name: '경쟁 환경',
    shortName: '경쟁 환경',
    weight: 20,
    summary: '동일·유사 업종 밀집도, 대형 브랜드 점유율, 차별화 진입 여지',
    checkpoints: [
      '도보권 내 직접 경쟁 매장 수 및 최근 1년간 개·폐업 동향',
      '상권 내 선도 브랜드의 가격 경쟁력과 고객 충성도 수준',
      '자사 콘셉트·메뉴·서비스로 차별화할 수 있는 시장 공백 여부',
    ],
    levelDescriptions: {
      1: '동일 업종이 과밀 포화 상태이며 출혈 경쟁 위험이 매우 높습니다.',
      2: '강력한 기존 경쟁자가 다수 자리 잡아 초기 고객 확보 부담이 큽니다.',
      3: '경쟁 매장이 존재하지만 상품·서비스 차별화로 공존할 여지가 있습니다.',
      4: '직접 경쟁 강도가 낮고 상권 내 우위를 점하기 유리한 환경입니다.',
      5: '유사 경쟁이 거의 없거나 상권 집객 시너지가 매우 뛰어난 블루오션입니다.',
    },
    barColor: '#0284C7',
  },
  {
    key: 'accessibility',
    indexLabel: '03',
    name: '입지 접근성',
    shortName: '입지 접근성',
    weight: 20,
    summary: '대중교통·보행 동선 연결성, 가시성(간판 노출), 주차 및 출입 편의성',
    checkpoints: [
      '지하철역·버스정류장·주요 횡단보도에서의 도보 접근 시간',
      '주 보행로에서의 매장 전면 노출도(가시성)와 진입 장벽 유무',
      '주차 공간 확보 여부 및 비·눈 등 악천후 시 방문 편의성',
    ],
    levelDescriptions: {
      1: '이면 골목·고층 등으로 가시성이 낮고 대중교통·도보 접근이 불편합니다.',
      2: '주 동선에서 다소 벗어나 있어 목적 방문 유도 없이는 유입이 어렵습니다.',
      3: '기본적인 보행 접근성과 노출은 무난하나 주차나 시인성 보완이 필요합니다.',
      4: '주 보행 동선에 인접해 시인성이 좋고 대중교통 접근이 편리합니다.',
      5: '역세권·코너 1층 등 최고 수준의 가시성과 동선 접근성을 확보했습니다.',
    },
    barColor: '#0D9488',
  },
  {
    key: 'profitability',
    indexLabel: '04',
    name: '수익성',
    shortName: '수익성',
    weight: 25,
    summary: '임대료·보증금·권리금 부담 대비 예상 매출, 손익분기점(BEP) 달성 가능성',
    checkpoints: [
      '예상 월 매출 대비 임대료 및 관리비 비율(적정 임차료율) 검토',
      '초기 투자비(권리금·인테리어·설비) 회수 기간 및 자금 여유도',
      '인건비·원재료비 상승을 고려한 보수적 순이익률 시뮬레이션',
    ],
    levelDescriptions: {
      1: '임대료와 초기 투자비 부담이 과도해 손익분기점 달성이 매우 어렵습니다.',
      2: '고정비 비중이 높아 매출 변동 시 적자 전환 위험이 큽니다.',
      3: '표준 매출 달성 시 손익 유지가 가능하나 임대 조건 협상이 권장됩니다.',
      4: '합리적인 임대 조건과 안정적인 마진 구조로 양호한 수익이 기대됩니다.',
      5: '낮은 고정비 부담과 높은 기대 매출로 투자 회수 및 수익성이 탁월합니다.',
    },
    barColor: '#4F46E5',
  },
  {
    key: 'logistics',
    indexLabel: '05',
    name: '공급물류',
    shortName: '공급물류',
    weight: 10,
    summary: '식자재·상품 납품 차량 진입, 하역 편의성, 창고·저장 공간 확보',
    checkpoints: [
      '납품 차량 주정차 및 새벽·주간 하역 작업 가능 여부',
      '본사 물류센터 또는 주요 거래처로부터의 배송 주기 및 추가 물류비',
      '매장 내 적정 재고 보관을 위한 냉장·냉동·창고 공간 여유도',
    ],
    levelDescriptions: {
      1: '차량 진입 불가 및 저장 공간 부족으로 안정적인 물류 운영이 어렵습니다.',
      2: '하역 동선이 불편하거나 추가 배송비 등 물류 운영 부담이 발생합니다.',
      3: '일반적인 납품과 재고 보관은 가능하나 피크 시 공간 관리가 필요합니다.',
      4: '납품 차량 접근과 하역이 원활하며 매장 내 저장 공간도 충분합니다.',
      5: '물류 동선, 하역 환경, 재고 보관 인프라가 모두 최적화되어 있습니다.',
    },
    barColor: '#64748B',
  },
];

export const SCORE_TIERS: ScoreTier[] = [
  {
    id: 'recommend',
    min: 80,
    max: 100,
    rangeLabel: '80 ~ 100점',
    label: '적극 출점 권장',
    shortStatus: '출점 유망',
    summary:
      '수요·입지·수익성 전반의 경쟁력이 우수합니다. 계약 조건 최종 검토 후 출점을 적극 추진할 수 있는 구간입니다.',
    actionGuide:
      '임대차 계약 특약, 인허가 사항, 공사 일정 등 실행 단계의 세부 리스크를 최종 점검하세요.',
    accentColor: '#047857',
    textClass: 'text-[#047857]',
    bgTintClass: 'bg-[#ECFDF5]',
    borderClass: 'border-[#A7F3D0]',
  },
  {
    id: 'caution',
    min: 60,
    max: 79,
    rangeLabel: '60 ~ 79점',
    label: '신중한 검토',
    shortStatus: '보완 후 판단',
    summary:
      '출점 가능성은 열려 있으나 일부 항목의 취약점이 존재합니다. 현장 실사와 조건 보완을 거친 뒤 신중하게 결정해야 합니다.',
    actionGuide:
      '점수가 낮은 항목(특히 배점 25점인 고객 수요·수익성)의 임대료 조정 또는 차별화 전략을 먼저 수립하세요.',
    accentColor: '#B45309',
    textClass: 'text-[#B45309]',
    bgTintClass: 'bg-[#FFFBEB]',
    borderClass: 'border-[#FDE68A]',
  },
  {
    id: 'hold',
    min: 40,
    max: 59,
    rangeLabel: '40 ~ 59점',
    label: '출점 보류',
    shortStatus: '조건 재설계 필요',
    summary:
      '핵심 입지 요건이나 수익 구조에 뚜렷한 부담이 확인됩니다. 현 조건으로의 출점은 보류하고 대안 입지를 비교해야 합니다.',
    actionGuide:
      '동일 상권 내 대체 점포를 추가 조사하거나, 업종 포맷·임차 면적을 축소해 고정비 구조를 재설계하세요.',
    accentColor: '#C2410C',
    textClass: 'text-[#C2410C]',
    bgTintClass: 'bg-[#FFF7ED]',
    borderClass: 'border-[#FED7AA]',
  },
  {
    id: 'avoid',
    min: 20,
    max: 39,
    rangeLabel: '20 ~ 39점',
    label: '출점 재고',
    shortStatus: '출점 비추천',
    summary:
      '수요 기반, 경쟁 환경, 수익성 전반에 걸쳐 사업 리스크가 매우 높습니다. 해당 입지는 제외하고 전면 재검토가 필요합니다.',
    actionGuide:
      '기존 후보지 리스트에서 제외하고 상권 선정 기준 자체를 다시 점검한 뒤 새로운 후보지를 발굴하세요.',
    accentColor: '#BE123C',
    textClass: 'text-[#BE123C]',
    bgTintClass: 'bg-[#FFF1F2]',
    borderClass: 'border-[#FECDD3]',
  },
];

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'default',
    name: '기본값 (각 3점)',
    description: '전 항목 3점 · 합계 60점 (신중한 검토)',
    scores: {
      demand: 3,
      competition: 3,
      accessibility: 3,
      profitability: 3,
      logistics: 3,
    },
  },
  {
    id: 'perfect',
    name: '만점 예시 (각 5점)',
    description: '전 항목 5점 · 합계 100점 (적극 출점 권장)',
    scores: {
      demand: 5,
      competition: 5,
      accessibility: 5,
      profitability: 5,
      logistics: 5,
    },
  },
  {
    id: 'station-front',
    name: '역세권 고임대료 상권',
    description: '수요·접근성 우수, 경쟁·임대료 부담 · 69점',
    scores: {
      demand: 5,
      competition: 2,
      accessibility: 5,
      profitability: 2,
      logistics: 3,
    },
  },
  {
    id: 'neighborhood',
    name: '주거지 틈새 상권',
    description: '경쟁 완화·수익성 양호, 접근성 보완 필요 · 65점',
    scores: {
      demand: 3,
      competition: 4,
      accessibility: 2,
      profitability: 4,
      logistics: 3,
    },
  },
  {
    id: 'high-risk',
    name: '고위험 입지 예시',
    description: '수요 부족·수익성 저조 · 32점',
    scores: {
      demand: 1,
      competition: 2,
      accessibility: 2,
      profitability: 1,
      logistics: 3,
    },
  },
];

export function calculateItemScore(score: ScoreValue, weight: number): number {
  return (score / 5) * weight;
}

export function calculateTotalScore(scores: ScoreMap): number {
  return CRITERIA.reduce(
    (sum, item) => sum + calculateItemScore(scores[item.key], item.weight),
    0
  );
}

export function getInterpretation(totalScore: number): ScoreTier {
  const matched = SCORE_TIERS.find(
    (tier) => totalScore >= tier.min && totalScore <= tier.max
  );
  return matched ?? SCORE_TIERS[SCORE_TIERS.length - 1];
}
