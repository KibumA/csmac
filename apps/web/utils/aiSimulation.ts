import { JobInstruction } from '@csmac/types';

export interface AIAnalysisResult {
    score: number;
    analysis: string;
    isPass: boolean;
}

const FAIL_REASONS = [
    '기준 이미지 대비 객실 바닥 청결도 미흡',
    '어메니티 배치 각도 불일치 (가이드라인 대비 15도 차이)',
    '침구류 구김방지 기준 미달',
    '테이블 위 먼지 식별됨',
    '욕실 거울 물기 제거 상태 부적정'
];

const PASS_COMMENTS = [
    '모든 점검 항목 표준 이미지와 95% 이상 일치',
    '정상 배치 및 청결 상태 양호',
    '표준 가이드라인 준수 확인',
    'AI 판독 결과: 매우 우수'
];

export const simulateAIAnalysis = (item: JobInstruction): AIAnalysisResult => {
    // Generate a semi-random score that correlates somewhat with existing status
    // but adds variety for demonstration.
    let score: number;

    if (item.subject.includes('VIP') || item.subject.includes('긴급')) {
        // High priority items have more variance in simulation
        score = Math.floor(Math.random() * 40) + 60; // 60-100
    } else {
        score = Math.floor(Math.random() * 30) + 70; // 70-100
    }

    // Force some failures for "non_compliant" or specific keywords
    if (item.status === 'non_compliant' || item.subject.includes('점검')) {
        if (Math.random() > 0.6) {
            score = Math.floor(Math.random() * 30) + 40; // 40-70
        }
    }

    const isPass = score >= 80;
    const analysis = isPass
        ? PASS_COMMENTS[Math.floor(Math.random() * PASS_COMMENTS.length)]
        : FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)];

    return {
        score,
        analysis,
        isPass
    };
};
