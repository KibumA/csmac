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

const ASSIGNEES = ['김철수', '이영희', '박민수', '최지훈', '정수진'];
const TEAMS = {
    'housekeeping': '객실관리',
    'front': '프론트',
    'facility': '시설'
};

async function generateData() {
    console.log('--- Generating Test Data (5 items per TPO) ---');

    // 1. Fetch all TPOs
    const { data: tpos, error: tpoError } = await supabase.from('tpo').select('*');
    if (tpoError) {
        console.error('Error fetching TPOs:', tpoError);
        return;
    }
    console.log(`Found ${tpos.length} TPOs.`);

    for (const tpo of tpos) {
        // 2. Count existing records for this TPO
        const { count, error: countError } = await supabase
            .from('job_instructions')
            .select('*', { count: 'exact', head: true })
            .eq('tpo_id', tpo.id)
            .in('status', ['completed', 'non_compliant']);

        if (countError) {
            console.error(`Error counting for TPO ${tpo.id}:`, countError);
            continue;
        }

        const needed = 5 - (count || 0);
        console.log(`TPO [${tpo.id}] ${tpo.tpo_place} / ${tpo.tpo_occasion}: Existing ${count}, Needed ${needed}`);

        if (needed > 0) {
            const inserts = [];
            for (let i = 0; i < needed; i++) {
                const isCompliant = Math.random() > 0.2; // 80% pass
                const status = isCompliant ? 'completed' : 'non_compliant';
                const result = isCompliant ? 'pass' : 'fail';
                const assignee = ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)];

                // Random time in last 3 days
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 3));
                date.setHours(Math.floor(Math.random() * 9) + 9); // 9 AM - 6 PM

                inserts.push({
                    tpo_id: tpo.id,
                    team: TEAMS[tpo.team] || tpo.team,
                    assignee: assignee,
                    subject: `[${tpo.tpo_place}] ${tpo.tpo_occasion} - 정기 점검 (${i + 1})`,
                    description: '자동 생성된 테스트 데이터입니다.',
                    status: status,
                    started_at: new Date(date.getTime() - 3600000).toISOString(), // 1 hour before completion
                    completed_at: date.toISOString(),
                    evidence_url: 'https://placehold.co/600x400/png', // Dummy image
                    verification_result: result
                });
            }

            const { error: insertError } = await supabase.from('job_instructions').insert(inserts);
            if (insertError) {
                console.error(`Error inserting for TPO ${tpo.id}:`, insertError);
            } else {
                console.log(`  -> Inserted ${needed} records.`);
            }
        }
    }

    console.log('--- Data Generation Complete ---');
}

generateData();
