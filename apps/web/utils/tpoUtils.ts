import { TaskStage } from '@csmac/types';

/**
 * Maps TPO 'Time' or 'Occasion' to a Task Stage (Pre/During/Post).
 * Logic inferred from CS_MAC_MVP.md Slide 12 context.
 */
export const getStageFromTpo = (time: string, occasion: string): TaskStage => {
    const t = time.toLowerCase();
    const o = occasion.toLowerCase();

    // 1. After-service Keywords (영업 후)
    if (t.includes('영업후') || t.includes('영업 후') || o.includes('영업후') || o.includes('영업 후')) return 'after_service';

    // 2. Post-work Keywords
    if (t.includes('마감') || t.includes('close') || t.includes('종료') || t.includes('야간')) return 'post';
    if (o.includes('퇴실') || o.includes('정산') || o.includes('보고')) return 'post';

    // 3. Pre-work Keywords
    if (t.includes('오픈') || t.includes('개시') || t.includes('준비') || t.includes('점검') || t.includes('open')) return 'pre';
    if (o.includes('입실') || o.includes('준비') || o.includes('브리핑')) return 'pre';

    // 4. Default to During-work (Operation)
    return 'during';
};

export const STAGE_LABELS: Record<TaskStage, string> = {
    'pre': '업무 전',
    'during': '업무 중',
    'post': '업무 후',
    'after_service': '영업 후'
};
