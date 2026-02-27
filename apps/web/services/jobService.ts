import { supabase } from '../utils/supabaseClient';
import { JobInstructionDB } from '@csmac/types';
import { createNewTaskFromTemplate, prepareTaskAssignmentUpdate } from '../utils/job-utils';

export class JobService {
    /**
     * Fetches job instructions for a specific team.
     */
    static async fetchByTeam(team: string): Promise<JobInstructionDB[]> {
        const { data, error } = await supabase
            .from('job_instructions')
            .select('*')
            .eq('team', team)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Fetches inspection results (completed/non_compliant) for a team.
     */
    static async fetchInspectionResults(team: string): Promise<JobInstructionDB[]> {
        const { data, error } = await supabase
            .from('job_instructions')
            .select('*')
            .eq('team', team)
            .in('status', ['completed', 'non_compliant'])
            .order('completed_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    /**
     * Fetches all job instructions.
     */
    static async fetchAll(): Promise<JobInstructionDB[]> {
        const { data, error } = await supabase
            .from('job_instructions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    /**
     * Adds a new single job instruction.
     */
    static async add(payload: any): Promise<JobInstructionDB> {
        const { data, error } = await supabase
            .from('job_instructions')
            .insert([payload])
            .select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Failed to insert job instruction');
        return data[0];
    }

    /**
     * Deploys a task group to the board.
     */
    static async insert(payload: any): Promise<void> {
        const { error } = await supabase.from('job_instructions').insert(payload);
        if (error) throw error;
    }

    /**
     * Assigns a member to a task group.
     */
    static async assignMember(groupId: number, memberId: string): Promise<void> {
        // 1. Find an unassigned row for this groupId
        const { data: unassigned } = await supabase
            .from('job_instructions')
            .select('*')
            .eq('task_group_id', groupId)
            .is('assignee', null)
            .limit(1);

        if (unassigned && unassigned.length > 0) {
            const updatePayload = prepareTaskAssignmentUpdate(memberId);
            const { error } = await supabase
                .from('job_instructions')
                .update(updatePayload)
                .eq('id', unassigned[0].id);
            if (error) throw error;
        } else {
            // No unassigned row, fetch task info and insert a new row from template
            const { data: existing } = await supabase
                .from('job_instructions')
                .select('*')
                .eq('task_group_id', groupId)
                .limit(1);

            if (existing && existing.length > 0) {
                const insertPayload = createNewTaskFromTemplate(existing[0], memberId);
                const { error } = await supabase.from('job_instructions').insert(insertPayload);
                if (error) throw error;
            }
        }
    }

    /**
     * Batch deploys tasks for multiple members.
     */
    static async batchDeploy(deploymentPayloads: any[]): Promise<void> {
        if (deploymentPayloads.length === 0) return;
        const { error } = await supabase.from('job_instructions').insert(deploymentPayloads);
        if (error) throw error;
    }

    /**
     * Unassigns a member from a task group.
     */
    static async unassignMember(groupId: number, memberId: string): Promise<void> {
        const { data: memberJobs } = await supabase
            .from('job_instructions')
            .select('*')
            .eq('task_group_id', groupId)
            .eq('assignee', memberId);

        if (memberJobs && memberJobs.length > 0) {
            const { data: allJobs } = await supabase
                .from('job_instructions')
                .select('*')
                .eq('task_group_id', groupId);

            if (allJobs && allJobs.length > 1) {
                await supabase.from('job_instructions').delete().eq('id', memberJobs[0].id);
            } else {
                await supabase.from('job_instructions').update({ assignee: null }).eq('id', memberJobs[0].id);
            }
        }
    }

    /**
     * Updates job status with appropriate timestamps.
     */
    static async updateStatus(id: number, status: 'in_progress' | 'completed' | 'delayed'): Promise<void> {
        const updates: any = { status };
        const now = new Date().toISOString();

        if (status === 'in_progress') updates.started_at = now;
        if (status === 'completed') updates.completed_at = now;

        const { error } = await supabase
            .from('job_instructions')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    }

    /**
     * Uploads evidence photo to storage.
     */
    static async uploadEvidence(file: File): Promise<string | null> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('evidence-photos').upload(fileName, file);
        if (error) throw error;

        const { data } = supabase.storage.from('evidence-photos').getPublicUrl(fileName);
        return data.publicUrl;
    }

    /**
     * Completes a job with optional evidence URL.
     */
    static async completeJob(id: number, evidenceUrl: string | null): Promise<void> {
        const updates: any = {
            status: 'completed',
            completed_at: new Date().toISOString()
        };
        if (evidenceUrl) updates.evidence_url = evidenceUrl;

        const { error } = await supabase.from('job_instructions').update(updates).eq('id', id);
        if (error) throw error;
    }

    /**
     * Updates the feedback comment for a job.
     */
    static async updateFeedback(id: number, feedback: string): Promise<void> {
        const { error } = await supabase
            .from('job_instructions')
            .update({ feedback_comment: feedback })
            .eq('id', id);
        if (error) throw error;
    }

    /**
     * Resolves a risk by marking it as completed.
     */
    static async resolveRisk(id: number): Promise<void> {
        const { error } = await supabase
            .from('job_instructions')
            .update({
                status: 'completed',
                verification_result: 'pass'
            })
            .eq('id', id);
        if (error) throw error;
    }

    /**
     * Removes all jobs in a task group from the board.
     */
    static async deleteByGroupId(groupId: number): Promise<void> {
        const { error } = await supabase
            .from('job_instructions')
            .delete()
            .eq('task_group_id', groupId);
        if (error) throw error;
    }
}
