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
    // Determine target outcome based on item status
    // If it's already marked as 'non_compliant' or failed in verification, force a low score.
    const shouldFail = item.status === 'non_compliant' || item.verificationResult === 'fail';

    let score: number;
    let analysis: string;

    if (shouldFail) {
        // Fail Scenario: Score between 40 and 79
        score = Math.floor(Math.random() * 40) + 40;
        analysis = FAIL_REASONS[Math.floor(Math.random() * FAIL_REASONS.length)];
    } else {
        // Pass Scenario: Score between 80 and 100
        // Add some variety based on subject for realism
        if (item.subject.includes('VIP')) {
            score = Math.floor(Math.random() * 10) + 90; // 90-100 for VIP
        } else {
            score = Math.floor(Math.random() * 20) + 80; // 80-100 standard
        }
        analysis = PASS_COMMENTS[Math.floor(Math.random() * PASS_COMMENTS.length)];
    }

    return {
        score,
        analysis,
        isPass: score >= 80
    };
};
