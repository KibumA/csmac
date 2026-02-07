import { CORE_CHECK_POINTS } from '../constants/library-config';

/**
 * Helper: Generate sub-check points for detailed view
 * @param content The checklist item content
 * @returns 4 core check points
 */
export const getCheckPoints = (content: string): string[] => {
    // Find matching key in config
    const matchKey = Object.keys(CORE_CHECK_POINTS).find(key => content.includes(key));

    if (matchKey) {
        return CORE_CHECK_POINTS[matchKey];
    }

    // Default 4 points for other items (Generic fallback)
    return [
        `${content} 작업의 표준 절차를 준수하였는가?`,
        '수행 결과가 육안으로 보기에 청결하고 정돈되었는가?',
        '작업 중 발생한 폐기물이나 잔여물이 모두 제거되었는가?',
        '다음 작업자나 고객이 즉시 사용할 수 있는 상태인가?'
    ];
};
