import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Evidence image URLs from Unsplash (free to use)
const EVIDENCE_IMAGES = {
    lobbyDesk: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    hotelRoom: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    bathroom: 'https://images.unsplash.com/photo-1552902019-ebcd97aa9aa0?w=800',
    mechanicalRoom: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
    bedding: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
};

// Realistic hotel operation seed data
const seedData = [
    // 프론트 팀 - 업무전 로비 인스펙션
    {
        team: '프론트',
        assignee: '박기철',
        subject: '로비 데스크 준비 점검',
        description: '체크인 오픈 전 로비 데스크 정돈, 예약 현황 확인, 키카드 재고 점검',
        status: 'completed',
        evidence_url: EVIDENCE_IMAGES.lobbyDesk,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    // 프론트 팀 - 업무중 고객 응대
    {
        team: '프론트',
        assignee: '최민주',
        subject: 'VIP 고객 체크인 절차',
        description: 'VIP 고객 체크인 절차, 대기 고객 동선 안내',
        status: 'in_progress',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    // 객실관리 팀 - 업무전 객실 인스펙션
    {
        team: '객실관리',
        assignee: '이대한',
        subject: '객실 상태 표준 정비 점검',
        description: '침구류 오염 및 주름 상태 확인, 어메니티 보충, 욕실 청결 점검',
        status: 'completed',
        evidence_url: EVIDENCE_IMAGES.hotelRoom,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    // 객실관리 팀 - 업무중 객실 정비
    {
        team: '객실관리',
        assignee: '김수정',
        subject: '퇴실 객실 턴오버 작업',
        description: '퇴실 객실 턴오버, 린넨 교체, 미니바 보충',
        status: 'in_progress',
        deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    // 객실관리 팀 - 지연
    {
        team: '객실관리',
        assignee: '박서연',
        subject: '침구류 상태 점검 및 교체',
        description: '침구류 오염 확인, 필요시 즉시 교체',
        status: 'delayed',
        evidence_url: EVIDENCE_IMAGES.bedding,
        deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전 마감
        started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    // 시설 팀 - 업무전 안전 점검
    {
        team: '시설',
        assignee: '정우진',
        subject: '소방 설비 일일 점검',
        description: '소방 설비 점검, 전기 차단기 확인, CCTV 작동 체크',
        status: 'waiting',
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    // 시설 팀 - 업무중 시설 점검
    {
        team: '시설',
        assignee: '강태양',
        subject: '객실 하자 보수 작업',
        description: '객실 하자 보수(배수, 조명, 가구)',
        status: 'in_progress',
        evidence_url: EVIDENCE_IMAGES.mechanicalRoom,
        deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    // 고객지원/CS 팀 - 업무중 VOC 처리
    {
        team: '고객지원/CS',
        assignee: '윤지아',
        subject: '컴플레인 접수 및 초기 대응',
        description: '컴플레인 접수 및 초기 대응, 보상 프로세스 진행',
        status: 'waiting',
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    },
    // 시설 팀 - 미준수
    {
        team: '시설',
        assignee: '김현수',
        subject: '실내 온도 및 조명 작동 확인',
        description: '객실 에어컨 온도 조절, 조명 정상 작동 여부 확인',
        status: 'non_compliant',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전 마감
        started_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    },
];

async function seed() {
    console.log('🌱 Starting seed process...');

    try {
        // Insert seed data
        const { data, error } = await supabase
            .from('job_instructions')
            .insert(seedData)
            .select();

        if (error) {
            console.error('❌ Error inserting seed data:', error);
            process.exit(1);
        }

        console.log(`✅ Successfully inserted ${data?.length || 0} job instructions`);
        console.log('📊 Summary:');
        console.log('  - Completed: 2');
        console.log('  - In Progress: 3');
        console.log('  - Waiting: 2');
        console.log('  - Delayed: 1');
        console.log('  - Non-compliant: 1');
        console.log('\n🎯 Navigate to Command Center to see the results!');

    } catch (err) {
        console.error('❌ Unexpected error:', err);
        process.exit(1);
    }
}

seed();
