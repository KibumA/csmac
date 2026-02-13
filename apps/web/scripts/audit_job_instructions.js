const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Manual env parsing
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditData() {
    console.log('🔍 Starting Data Audit for job_instructions table...\n');

    // 1. Get total count
    const { count, error: countError } = await supabase
        .from('job_instructions')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Failed to get total count:', countError.message);
        return;
    }

    console.log(`📊 Total Records in job_instructions: ${count}`);

    // 2. Get distinct assignees and their counts
    const { data: allAssignees, error: assigneesError } = await supabase
        .from('job_instructions')
        .select('assignee');

    if (assigneesError) {
        console.error('Failed to get assignees:', assigneesError.message);
        return;
    }

    const assigneeCounts = {};
    allAssignees.forEach(item => {
        const name = item.assignee || 'NULL';
        assigneeCounts[name] = (assigneeCounts[name] || 0) + 1;
    });

    console.log('\n👤 Assignee Distribution (Raw Data in DB):');
    console.table(Object.entries(assigneeCounts).map(([name, count]) => ({ Name: name, Count: count })));

    // 3. Specifically look for "담당자" or suspicious entries
    const suspicious = Object.keys(assigneeCounts).filter(name => name.includes('담당자'));
    if (suspicious.length > 0) {
        console.log('\n⚠️  SUSPICIOUS DATA FOUND:');
        suspicious.forEach(name => {
            console.log(`   - "${name}": ${assigneeCounts[name]} records`);
        });
    } else {
        console.log('\n✅ No "담당자" literal strings found as raw values.');
    }

    console.log('\n🏁 Audit Complete.');
}

auditData();
