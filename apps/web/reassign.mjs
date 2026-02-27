import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujdadumbtzdfzcclruxf.supabase.co';
const supabaseKey = 'sb_publishable_70s0Hd2anIQIHDt03kw35w_vZQhvYZk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // Fetch the broken null assignee tasks
    const { data: brokenTasks, error } = await supabase
        .from('job_instructions')
        .select('*')
        .is('assignee', null)
        .in('status', ['waiting', 'non_compliant', 'completed'])
        .order('id', { ascending: false });

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    console.log(`Found ${brokenTasks?.length || 0} unassigned tasks.`);

    if (brokenTasks && brokenTasks.length > 0) {
        for (const task of brokenTasks) {
            let targetAssignee = '권도현'; // Default fallback

            if (task.subject.includes("복도 소음")) {
                targetAssignee = '노현우';
            } else if (task.subject.includes("침대 베딩")) {
                targetAssignee = '윤하준';
            }

            console.log(`Re-assigning Task ID [${task.id}] "${task.subject}" to ${targetAssignee} ...`);

            const { error: updateError } = await supabase
                .from('job_instructions')
                .update({ assignee: targetAssignee })
                .eq('id', task.id);

            if (updateError) {
                console.error(`Failed to update Task ID ${task.id}:`, updateError);
            } else {
                console.log(`Success!`);
            }
        }
    }
}

main();
