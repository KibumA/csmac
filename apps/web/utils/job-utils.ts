import { JobInstructionDB } from '@csmac/types';

/**
 * Creates a clean task payload from an existing template for a new assignee.
 * This ensures that sensitive fields like evidence_url, started_at, and completed_at
 * are explicitly nulled out to prevent data leakage between tasks.
 * 
 * @param template The existing JobInstructionDB record to use as a template
 * @param assignee The new member ID to assign this task to
 * @returns A partial JobInstructionDB object ready for insertion
 */
export const createNewTaskFromTemplate = (
    template: JobInstructionDB,
    assignee: string
): Omit<JobInstructionDB, 'id' | 'created_at' | 'updated_at'> => {
    return {
        tpo_id: template.tpo_id,
        task_group_id: template.task_group_id,
        team: template.team,
        subject: template.subject,
        description: template.description,
        status: 'waiting',
        assignee: assignee,
        // Explicitly nulling out execution-related fields to prevent 'ghost' data
        evidence_url: null,
        started_at: null,
        completed_at: null,
        deadline: template.deadline,
        workplace: template.workplace,
        job: template.job,
        ai_score: null,
        ai_analysis: null,
        feedback_comment: null,
        verification_result: null
    };
};

/**
 * Prepares an update payload for an existing unassigned task row.
 * 
 * @param assignee The member ID to assign
 * @returns An update payload object
 */
export const prepareTaskAssignmentUpdate = (assignee: string) => {
    return {
        assignee: assignee,
        status: 'waiting',
        started_at: null,
        completed_at: null,
        evidence_url: null
    };
};
