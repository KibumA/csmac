import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, 'apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in apps/web/.env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    const { data, error } = await supabase
        .from('job_instructions')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error);
    } else {
        console.table(data.map(d => ({
            id: d.id,
            subject: d.subject,
            assignee: d.assignee,
            status: d.status,
            verification_result: d.verification_result
        })));
    }
}

checkJobs();
