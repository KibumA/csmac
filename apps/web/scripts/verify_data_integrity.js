
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');

        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    } catch (err) {
        console.error('Could not load .env.local:', err.message);
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not found in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDataIntegrity() {
    console.log('🔍 Starting Data Integrity Verification for job_instructions...');

    // Fetch all job instructions
    const { data: jobs, error } = await supabase
        .from('job_instructions')
        .select('id, assignee, status, team');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (!jobs || jobs.length === 0) {
        console.log('No job instructions found.');
        return;
    }

    console.log(`📊 Total Job Instructions: ${jobs.length}`);

    // Frequency Analysis
    const assigneeCounts = {};
    let nullAssignees = 0;
    let legacyFormatVal = 0;

    jobs.forEach(job => {
        const assignee = job.assignee;

        if (assignee === null) {
            nullAssignees++;
        } else {
            // Check for legacy format (bracket pattern)
            if (assignee.includes('(')) {
                legacyFormatVal++;
            }
            // Count specific values
            assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;
        }
    });

    console.log('\n--- Assignee Distribution ---');
    console.log(`NULL (Unassigned): ${nullAssignees}`);
    console.log(`Legacy Format (with brackets): ${legacyFormatVal}`);

    console.log('\n--- Top 10 Assignees ---');
    Object.entries(assigneeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([name, count]) => {
            console.log(`${name}: ${count}`);
        });

    // Check specifically for "담당자" string
    const ghostDataCount = assigneeCounts['담당자'] || 0;
    console.log(`\n👻 Ghost Data Check ("담당자"): ${ghostDataCount}`);

    if (ghostDataCount === 0) {
        console.log('✅ CLEAN: No "담당자" string found in DB.');
    } else {
        console.error('❌ DIRTY: found "담당자" string in DB!');
    }
}

verifyDataIntegrity();
