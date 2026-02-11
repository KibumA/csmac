/**
 * wipe_and_seed.js
 * 
 * 1단계: 모든 DB 테이블 완전 초기화
 * 2단계: 현실적인 호텔 운영 데이터 시딩
 * 
 * Usage: node apps/web/scripts/wipe_and_seed.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ─── ENV Loader ───
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
    console.error('❌ Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ═══════════════════════════════════════════════════
// 1단계: DB 완전 초기화
// ═══════════════════════════════════════════════════
async function wipeAllData() {
    console.log('\n🗑️  ═══ 1단계: DB 완전 초기화 ═══');

    // 종속성 순서대로 삭제 (자식 → 부모)
    const tables = [
        'job_instructions',
        'task_group_items',
        'task_groups',
        'checklist_items',
        'tpo'
    ];

    for (const table of tables) {
        // neq filter with a non-existent value to match all rows
        const { error } = await supabase.from(table).delete().neq('id', -99999);
        if (error) {
            console.error(`  ❌ ${table} 삭제 실패:`, error.message);
        } else {
            console.log(`  ✅ ${table} — 전체 삭제 완료`);
        }
    }
    console.log('  🏁 DB 초기화 완료!\n');
}

// ═══════════════════════════════════════════════════
// 2단계: 현실적인 호텔 운영 데이터 시딩
// ═══════════════════════════════════════════════════

// ─── 팀별 담당자 (현실적 인원 배분) ───
const TEAM_ASSIGNEES = {
    '프론트': {
        '지배인': ['김철수'],                     // 1명
        '리셉션': ['이영희', '노현우', '배수진', '오세진', '권도현'],  // 5명
        '컨시어즈': ['최윤서', '윤하준', '정다은']   // 3명
    },
    '객실관리': {
        '인스펙터': ['박미숙', '최영미', '서금옥'],   // 3명
        '룸메이드': ['김순영', '한옥순', '오미영', '강수미', '임보라', '배옥희', '허순덕'], // 7명
        '코디사원': ['이정자', '정혜진', '윤정희']    // 3명
    },
    '시설': {
        '엔지니어': ['김태섭', '박진우', '한승기', '오창민', '강현철'], // 5명
        '환경관리': ['이상호', '최동혁', '정용수']    // 3명
    },
    '고객지원/CS': {
        '컨택센터 상담원': ['김나연', '오예진', '윤수아', '노은지', '허윤아'], // 5명
        '고객서비스팀': ['이수빈', '한지유', '임하늘'],  // 3명
        'CS파트': ['박소희', '정서영', '강채원']       // 3명
    },
    '마케팅/영업': {
        '마케팅전략팀': ['김지훈', '한민서', '오준혁'],  // 3명
        '영업기획': ['이하은', '정우빈', '윤시우']      // 3명
    },
    '경영/HR': {
        '교육개발팀': ['김관호', '오민수', '윤미선'],    // 3명
        '인사(HRD)': ['이수정', '한경민', '임세환'],    // 3명
        '상황실 관리자': ['박성훈', '정보경', '강호진']  // 3명
    }
};

// ─── TPO 시나리오 (팀별 현실적인 업무) ───
const TPO_SCENARIOS = [
    // ── 프론트 ──
    {
        team: '프론트', job: '지배인', time: '업무전', place: '로비', occasion: '고객 환대/응대',
        evidence: '사진', method: '정기점검', elements: ['용모', '인사'],
        checklist: '고객 맞이 및 체크인 준비 상태 점검',
        items: ['맞이 인사(Greeting) 수행 여부', '대기 번호표 발행 및 안내', '용모 복장 및 명찰 착용 상태', '로비 향기 및 배경음악 점검']
    },
    {
        team: '프론트', job: '리셉션', time: '업무중', place: '로비', occasion: '고객 환대/응대',
        evidence: '사진', method: '정기점검', elements: ['응대', '서비스'],
        checklist: '체크인/체크아웃 응대 절차 준수 여부',
        items: ['예약 확인 및 본인 인증', '객실 배정 및 키카드 발급', '부대시설 이용 안내', '짐 운반 지원 여부 확인']
    },
    {
        team: '프론트', job: '컨시어즈', time: '업무중', place: '로비', occasion: '컴플레인/VOC 처리',
        evidence: '사진', method: '정기점검', elements: ['VOC', '응대'],
        checklist: '고객 불편사항 처리 절차 준수',
        items: ['대기 시간 지연 안내 및 양해', '컴플레인 고객 별도 장소 안내', '책임자 응대 및 상황 설명', '사후 피드백 연락처 확인']
    },
    {
        team: '프론트', job: '지배인', time: '업무후', place: '로비', occasion: '영업 준비/마감',
        evidence: '사진', method: '정기점검', elements: ['마감', '인수인계'],
        checklist: '로비 마감 및 야간 인수인계 완료',
        items: ['일일 매출 마감 확인', '야간 프론트 간 인수인계', '미처리 VOC 상태 공유', '시건장치 점검']
    },

    // ── 객실관리 ──
    {
        team: '객실관리', job: '인스펙터', time: '업무전', place: '객실', occasion: '인스펙션 실행',
        evidence: '사진', method: '정기점검', elements: ['청결도', '비품'],
        checklist: '객실 정비 상태 사전 점검',
        items: ['체크리스트 준비 및 배분', '린넨 카트 수량 확인', '정비 예정 객실 리스트 확인', '특이사항 인수인계 확인']
    },
    {
        team: '객실관리', job: '룸메이드', time: '업무중', place: '객실', occasion: '객실 정비/세팅',
        evidence: '사진', method: '정기점검', elements: ['청결도', '세팅'],
        checklist: '객실 정비 매뉴얼 준수 여부',
        items: ['침대 베딩 텐션 유지', '바닥 카펫/플로어 청소 상태', '쓰레기통 비움 및 세척', '어메니티 재입고', '가구 먼지 및 얼룩 제거']
    },
    {
        team: '객실관리', job: '인스펙터', time: '업무중', place: '객실', occasion: '인스펙션 실행',
        evidence: '사진', method: '정기점검', elements: ['청결도', '온도'],
        checklist: '객실 상태 표준 점검',
        items: ['침구류 오염 및 주름 상태', '실내 온도 및 조명 작동', '미니바/비품 수량 확인', '욕실 물기 제거 및 배수', '창문 결로 및 환기 상태']
    },
    {
        team: '객실관리', job: '코디사원', time: '업무후', place: '창고/린넨실', occasion: '물품 전달/불출',
        evidence: '사진', method: '정기점검', elements: ['재고', '정리'],
        checklist: '린넨 및 비품 재고 마감 정리',
        items: ['린넨 청결도 및 오염 분류', '비품 수량과 장부 일치 여부', '창고 내부 정리 상태', '유통기한 확인', '운반 카트 점검']
    },

    // ── 시설 ──
    {
        team: '시설', job: '엔지니어', time: '업무전', place: '기계실/상황실', occasion: '시설/안전 점검',
        evidence: '사진', method: '정기점검', elements: ['설비', '안전'],
        checklist: '시설 설비 일일 시작 점검',
        items: ['냉난방기 압력 및 온도 체크', '화재 수신기 정상 작동 확인', 'CCTV 모니터링 사각지대 여부', '전기 판넬 과열 흔적 확인']
    },
    {
        team: '시설', job: '엔지니어', time: '업무중', place: '복도/E/V', occasion: '시설/안전 점검',
        evidence: '사진', method: '정기점검', elements: ['청결', '안전'],
        checklist: '공용구역 시설 및 청결 상태 유지',
        items: ['엘리베이터 거울 및 바닥 청결', '비상계단 적치물 유무 확인', '벽면 파손 및 오염 흔적', '비상구 유도등 점등 여부']
    },
    {
        team: '시설', job: '환경관리', time: '업무중', place: '주차장', occasion: '시설/안전 점검',
        evidence: '사진', method: '정기점검', elements: ['안전', '조명'],
        checklist: '주차장 안전 위해 요소 제거',
        items: ['포트홀 및 바닥 균열 유무', '조명 조도 및 작동 상태', '소화기 비치 및 점검 기록', '진입로 표지판 식별 가능 여부']
    },
    {
        team: '시설', job: '엔지니어', time: '업무후', place: '기계실/상황실', occasion: '영업 준비/마감',
        evidence: '사진', method: '정기점검', elements: ['인수인계', '백업'],
        checklist: '설비 시스템 야간 교대 점검',
        items: ['인수인계 일지 기록 상태', '비상 발전기 대기 모드 확인', '네트워크 서버 백업 체크', '제어실 출입 통제 장치 작동']
    },

    // ── 고객지원/CS ──
    {
        team: '고객지원/CS', job: '컨택센터 상담원', time: '업무중', place: '기계실/상황실', occasion: '컴플레인/VOC 처리',
        evidence: '사진', method: '정기점검', elements: ['응대', '기록'],
        checklist: '컨택센터 고객 응대 품질 점검',
        items: ['응대 스크립트 준수 여부', '고객 대기시간 모니터링', '통화 후 VOC 기록 작성', '에스컬레이션 절차 이행']
    },
    {
        team: '고객지원/CS', job: '고객서비스팀', time: '업무중', place: '로비', occasion: '컴플레인/VOC 처리',
        evidence: '사진', method: '정기점검', elements: ['VOC', '서비스'],
        checklist: '현장 고객 불편사항 대응',
        items: ['고객 경청 및 사과 표현', '즉시 보수/교체 필요 판단', '필요 시 보상안 안내', '정비팀/프론트와 정보 공유']
    },

    // ── 마케팅/영업 ──
    {
        team: '마케팅/영업', job: '마케팅전략팀', time: '업무중', place: '기계실/상황실', occasion: '영업 준비/마감',
        evidence: '사진', method: '정기점검', elements: ['데이터', '분석'],
        checklist: '일간 마케팅 성과 모니터링',
        items: ['예약률 및 객실 가동률 확인', '프로모션 적용 현황 점검', '웹사이트 트래픽 분석', 'OTA 채널 리뷰 관리']
    },

    // ── 경영/HR ──
    {
        team: '경영/HR', job: '교육개발팀', time: '업무중', place: '기계실/상황실', occasion: '시설/안전 점검',
        evidence: '사진', method: '정기점검', elements: ['교육', '관리'],
        checklist: '교육 프로그램 운영 현황 점검',
        items: ['월간 교육 이수율 확인', '신규 입사자 OJT 진행 상태', '서비스 매뉴얼 업데이트 여부', 'CS 평가 결과 분석']
    },
    {
        team: '경영/HR', job: '상황실 관리자', time: '업무중', place: '기계실/상황실', occasion: '시설/안전 점검',
        evidence: '사진', method: '정기점검', elements: ['모니터링', '상황'],
        checklist: '상황실 통합 모니터링 점검',
        items: ['CCTV 전체 채널 정상 수신', '화재/보안 경보 시스템 정상', '내부 통신 시스템 작동 확인', '비상 연락망 최신 여부']
    },
];

async function seedTPOsAndChecklists() {
    console.log('📦 ═══ 2단계: TPO 및 체크리스트 시딩 ═══');

    for (const scenario of TPO_SCENARIOS) {
        // 1. Insert TPO
        const { data: tpoData, error: tpoError } = await supabase.from('tpo').insert({
            workplace: '소노벨 천안',
            team: scenario.team,
            job: scenario.job,
            tpo_time: scenario.time,
            tpo_place: scenario.place,
            tpo_occasion: scenario.occasion,
            matching_evidence: scenario.evidence,
            matching_method: scenario.method,
            matching_elements: scenario.elements,
        }).select().single();

        if (tpoError) {
            console.error(`  ❌ TPO 삽입 실패 [${scenario.team}/${scenario.job}]:`, tpoError.message);
            continue;
        }

        // 2. Insert Checklist Items
        const itemsPayload = scenario.items.map(content => ({
            tpo_id: tpoData.id,
            content: content,
        }));

        const { error: itemsError } = await supabase.from('checklist_items').insert(itemsPayload);
        if (itemsError) {
            console.error(`  ❌ 체크리스트 삽입 실패 [TPO ${tpoData.id}]:`, itemsError.message);
        } else {
            console.log(`  ✅ TPO[${tpoData.id}] ${scenario.team}/${scenario.job} — ${scenario.checklist} (${scenario.items.length}항목)`);
        }
    }
    console.log('  🏁 TPO/체크리스트 시딩 완료!\n');
}

// ─── job_instructions 시딩 (현실적인 점검 기록) ───
async function seedJobInstructions() {
    console.log('📋 ═══ 3단계: 점검 기록(job_instructions) 시딩 ═══');

    // Fetch all newly created TPOs
    const { data: tpos, error: tpoError } = await supabase.from('tpo').select('*');
    if (tpoError || !tpos) {
        console.error('  ❌ TPO 조회 실패:', tpoError?.message);
        return;
    }

    let totalInserted = 0;

    for (const tpo of tpos) {
        const teamAssignees = TEAM_ASSIGNEES[tpo.team];
        if (!teamAssignees) continue;

        // Get assignees for this job
        const jobAssignees = teamAssignees[tpo.job] || [];
        if (jobAssignees.length === 0) continue;

        // Generate 3~5 instructions per TPO
        const count = 3 + Math.floor(Math.random() * 3);
        const inserts = [];

        for (let i = 0; i < count; i++) {
            const assignee = jobAssignees[i % jobAssignees.length];
            const isCompliant = Math.random() > 0.15; // 85% 준수율
            const status = isCompliant ? 'completed' : 'non_compliant';
            const result = isCompliant ? 'pass' : 'fail';

            // Random time in last 3 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 3));
            date.setHours(Math.floor(Math.random() * 9) + 9); // 9AM-6PM
            date.setMinutes(Math.floor(Math.random() * 60));

            inserts.push({
                tpo_id: tpo.id,
                team: tpo.team,
                assignee: `${assignee} (${tpo.job})`,
                subject: `[${tpo.tpo_place}] ${tpo.tpo_occasion} - 정기 점검 (${i + 1})`,
                description: `${tpo.tpo_place}에서 ${tpo.tpo_occasion} 수행 결과입니다.`,
                status: status,
                started_at: new Date(date.getTime() - 3600000).toISOString(),
                completed_at: date.toISOString(),
                evidence_url: 'https://placehold.co/600x400/png',
                verification_result: result,
            });
        }

        const { error: insertError } = await supabase.from('job_instructions').insert(inserts);
        if (insertError) {
            console.error(`  ❌ 점검 기록 삽입 실패 [TPO ${tpo.id}]:`, insertError.message);
        } else {
            totalInserted += inserts.length;
        }
    }

    console.log(`  ✅ 총 ${totalInserted}건의 점검 기록 생성 완료!`);
    console.log('  🏁 점검 기록 시딩 완료!\n');
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║  CSMAC DB 초기화 및 시딩 스크립트     ║');
    console.log('╚═══════════════════════════════════════╝');

    await wipeAllData();
    await seedTPOsAndChecklists();
    await seedJobInstructions();

    console.log('🎉 모든 작업 완료!');
    console.log('   → 앱을 새로고침하면 새 데이터가 반영됩니다.');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
