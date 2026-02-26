import { JobInstruction, JobInstructionDB, InspectionRecord } from '@csmac/types';

/**
 * Maps Supabase DB record to frontend JobInstruction type
 */
export const mapDbToJobInstruction = (item: JobInstructionDB): JobInstruction => {
    return {
        id: item.id,
        targetTeam: item.team,
        team: item.team,
        assignee: item.assignee ? item.assignee.split(' (')[0] : '',
        subject: item.subject,
        description: item.description || '',
        deadline: item.deadline || '',
        status: item.status || 'waiting',
        timestamp: item.created_at,
        created_at: item.created_at,
        aiScore: item.ai_score,
        aiAnalysis: item.ai_analysis,
        feedbackComment: item.feedback_comment,
        verificationResult: item.verification_result,
        evidenceUrl: item.evidence_url ?? undefined,
        tpo_id: item.tpo_id,
        taskGroupId: item.task_group_id
    };
};

/**
 * Maps Supabase DB record (job_instructions) to frontend InspectionRecord type
 */
export const mapDbToInspectionRecord = (item: JobInstructionDB): InspectionRecord => {
    const status: 'O' | 'X' = item.status === 'completed' ? 'O' : 'X';

    const timeStr = item.completed_at ? new Date(item.completed_at).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }) : new Date(item.created_at).toLocaleString('ko-KR');

    // Extract area from subject/description or default
    const areaMatch = item.subject.match(/\[(.*?)\]/);
    const area = areaMatch ? areaMatch[1] : (item.description?.substring(0, 10) || '현장');

    // Extract item/issue from subject
    const workItem = item.subject.replace(/\[.*?\]\s*/, '');

    return {
        id: item.id,
        time: timeStr,
        name: (item.assignee ? item.assignee.split(' (')[0] : null) || '미배정',
        area: area,
        item: workItem,
        status: status,
        role: item.team,
        reason: item.description ?? undefined,
        tpoId: item.tpo_id || 0
    };
};
