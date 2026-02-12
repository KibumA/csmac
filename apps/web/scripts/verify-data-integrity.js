
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Data Integrity Script (JS Version)

// Load env
function loadEnv(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                if (!process.env[key]) process.env[key] = value;
            }
        });
    }
}

loadEnv(path.join(__dirname, '../.env.local'));
loadEnv(path.join(__dirname, '../.env'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyIntegrity() {
    console.log('🔍 Starting Data Integrity Check (Node.js)...');
    let errors = 0;

    // 1. TPO Integrity
    const { data: tpos, error: tpoError } = await supabase.from('tpo').select('*');
    if (tpoError) { console.error('TPO Fetch Error', tpoError); return; }
    console.log(`✅ Loaded ${tpos.length} TPOs`);

    // 2. Job Instruction Integrity
    const { data: jobs, error: jobError } = await supabase.from('job_instructions').select('*');
    if (jobError) { console.error('Job Instruction Fetch Error', jobError); return; }
    console.log(`✅ Loaded ${jobs.length} Job Instructions`);

    // Check 2.1: Orphaned Jobs
    // Note: older job instructions might have null tpo_id. We check only if it IS set but invalid.
    const orphanedJobs = jobs.filter(j => j.tpo_id && !tpos.find(t => t.id === j.tpo_id));
    if (orphanedJobs.length > 0) {
        console.error(`❌ Found ${orphanedJobs.length} Orphaned Job Instructions (Invalid TPO ID)`);
        errors++;
    } else {
        console.log('✅ No orphaned jobs found (Foreign Key check).');
    }

    // Check 2.2: Status Validity
    const validStatuses = ['waiting', 'in_progress', 'completed', 'delayed', 'non_compliant'];
    const invalidStatusJobs = jobs.filter(j => !validStatuses.includes(j.status));
    if (invalidStatusJobs.length > 0) {
        console.error(`❌ Found ${invalidStatusJobs.length} jobs with invalid status:`, invalidStatusJobs.map(j => j.status));
        errors++;
    } else {
        console.log('✅ All job statuses are valid.');
    }

    // Check 2.3: Assignment Coverage (Warning only)
    const unassignedJobs = jobs.filter(j => !j.assignee);
    if (unassignedJobs.length > 0) {
        console.warn(`⚠️ Found ${unassignedJobs.length} unassigned jobs.`);
    }

    // 3. Scenario Coverage
    const teams = new Set(tpos.map(t => t.team));
    console.log(`ℹ️  Teams covered in TPO: ${Array.from(teams).join(', ')}`);

    // Check coverage per team
    const jobTeams = new Set(jobs.map(j => j.team));
    const uncoveredTeams = Array.from(teams).filter(t => !jobTeams.has(t));

    if (uncoveredTeams.length > 0) {
        console.warn(`⚠️ The following teams have NO job instructions: ${uncoveredTeams.join(', ')}`);
    } else {
        console.log('✅ All teams have at least one job instruction.');
    }

    const coveredTpoIds = new Set(jobs.map(j => j.tpo_id));
    const uncoveredTpos = tpos.filter(t => !coveredTpoIds.has(t.id));

    if (uncoveredTpos.length > 0) {
        console.warn(`⚠️ ${uncoveredTpos.length} TPOs have NO job instructions generated yet.`);
        // Don't error out, just warn.
    } else {
        console.log('✅ All TPOs have associated job instructions.');
    }

    // 4. Data Distribution Stats
    console.log('\n--- 📊 Data Distribution Stats ---');

    const statusCounts = jobs.reduce((acc, j) => {
        acc[j.status] = (acc[j.status] || 0) + 1;
        return acc;
    }, {});
    console.log('Statuses:', statusCounts);

    const resultCounts = jobs.reduce((acc, j) => {
        const res = j.verification_result || 'null';
        acc[res] = (acc[res] || 0) + 1;
        return acc;
    }, {});
    console.log('Verification Results:', resultCounts);

    // 5. Diversity Check (Time & People)
    console.log('\n--- 🌈 Diversity Check ---');

    // Join with TPOs to check time coverage
    const timeDistribution = jobs.reduce((acc, j) => {
        const tpo = tpos.find(t => t.id === j.tpo_id);
        if (tpo) {
            // Try multiple access patterns for 'time'
            const timeKey = tpo.tpo?.time || tpo.tpo_time || tpo.time || 'Unknown';
            acc[timeKey] = (acc[timeKey] || 0) + 1;
        }
        return acc;
    }, {});
    console.log('Time/Scene Coverage:', timeDistribution);

    // Check assignee distribution
    const assigneeCounts = jobs.reduce((acc, j) => {
        const name = j.assignee || 'Unassigned';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
    console.log('Assignee Workload:', assigneeCounts);

    if (errors === 0) {
        console.log('\n✨ Data Integrity Verified: PASSED');
    } else {
        console.error(`\n🚨 Data Integrity Verified: FAILED with ${errors} critical errors.`);
        process.exit(1);
    }
}

verifyIntegrity();
