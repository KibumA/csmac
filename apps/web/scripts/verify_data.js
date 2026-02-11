const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually read .env.local
function loadEnv(filePath) {
    if (fs.existsSync(filePath)) {
        console.log(`Loading env from ${filePath}`);
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

loadEnv(path.join(__dirname, '../.env.local'));
loadEnv(path.join(__dirname, '../.env'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
    console.log('--- Verifying Job Instructions Data ---');

    const { data: jobs, error } = await supabase
        .from('job_instructions')
        .select('id, tpo_id, task_group_id, team, status, subject, created_at');

    if (error) {
        console.error('Error fetching jobs:', error);
        return;
    }

    console.log(`Total Job Instructions: ${jobs.length}`);

    // Group by TPO ID
    const tpoCounts = {};
    const statusCounts = {};

    jobs.forEach(job => {
        const tpoId = job.tpo_id || 'Unknown';
        if (!tpoCounts[tpoId]) tpoCounts[tpoId] = 0;
        tpoCounts[tpoId]++;

        const status = job.status;
        if (!statusCounts[status]) statusCounts[status] = 0;
        statusCounts[status]++;
    });

    console.log('\n--- Counts by TPO ID ---');
    console.table(tpoCounts);

    console.log('\n--- Counts by Status ---');
    console.table(statusCounts);

    // List recent jobs
    console.log('\n--- Recent 5 Jobs ---');
    jobs.slice(0, 5).forEach(job => {
        console.log(`[${job.id}] ${job.status} - ${job.subject} (TPO: ${job.tpo_id})`);
    });
}

verifyData();
