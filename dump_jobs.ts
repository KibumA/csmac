import { supabase } from './apps/web/utils/supabaseClient';

async function main() {
    const { data, error } = await supabase
        .from('job_instructions')
        .select('*')
        .order('id', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Latest jobs:");
        for (const job of data) {
            console.log(`[${job.id}] nullGroup=${job.task_group_id === null} status=${job.status} subject="${job.subject}" assignee=${job.assignee} team=${job.team}`);
        }
    }
}

main();
