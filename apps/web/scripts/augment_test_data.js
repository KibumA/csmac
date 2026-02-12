
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 2. Data Augmentation Script (JS)
// Targets: Waiting, In Progress, Delayed

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
const supabase = createClient(supabaseUrl, supabaseKey);

const ASSIGNEES = ['김철수', '이영희', '박민수', '최지훈', '정수진', '강호진', '윤수아'];
const TEAMS = {
    'housekeeping': '객실관리',
    'front': '프론트',
    'facility': '시설',
    'customer_support': '고객지원/CS'
};

async function augmentData() {
    console.log('🚀 Starting Data Augmentation...');

    // Fetch TPOs for reference
    const { data: tpos } = await supabase.from('tpo').select('*');
    if (!tpos || tpos.length === 0) { console.error('No TPOs found'); return; }

    const inserts = [];

    // 1. Add 'Waiting' (Target +10)
    console.log('Adding "Waiting" tasks...');
    for (let i = 0; i < 10; i++) {
        const tpo = tpos[Math.floor(Math.random() * tpos.length)];
        inserts.push({
            tpo_id: tpo.id,
            team: TEAMS[tpo.team] || tpo.team,
            assignee: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)],
            subject: `[${tpo.tpo_place}] ${tpo.tpo_occasion} - 추가 업무지시 (${i + 1})`,
            description: '추가 생성된 대기 업무입니다.',
            status: 'waiting',
            created_at: new Date().toISOString()
        });
    }

    // 2. Add 'In Progress' (Target +8)
    console.log('Adding "In Progress" tasks...');
    for (let i = 0; i < 8; i++) {
        const tpo = tpos[Math.floor(Math.random() * tpos.length)];
        inserts.push({
            tpo_id: tpo.id,
            team: TEAMS[tpo.team] || tpo.team,
            assignee: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)],
            subject: `[${tpo.tpo_place}] ${tpo.tpo_occasion} - 진행 중 긴급 점검`,
            description: '현재 진행 중인 업무입니다.',
            status: 'in_progress',
            started_at: new Date(Date.now() - 3600000).toISOString(), // Started 1 hour ago
            created_at: new Date(Date.now() - 7200000).toISOString()
        });
    }

    // 3. Add 'Delayed' (Target +8)
    console.log('Adding "Delayed" tasks...');
    for (let i = 0; i < 8; i++) {
        const tpo = tpos[Math.floor(Math.random() * tpos.length)];
        // Deadline was yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        inserts.push({
            tpo_id: tpo.id,
            team: TEAMS[tpo.team] || tpo.team,
            assignee: ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)],
            subject: `[${tpo.tpo_place}] ${tpo.tpo_occasion} - 지연된 점검`,
            description: '마감 기한을 넘긴 업무입니다.',
            status: 'delayed',
            deadline: yesterday.toISOString(),
            created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        });
    }

    const { error } = await supabase.from('job_instructions').insert(inserts);
    if (error) {
        console.error('❌ Insert Error:', error);
    } else {
        console.log(`✅ Successfully added ${inserts.length} new records.`);
    }
}

augmentData();
