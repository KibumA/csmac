import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ujdadumbtzdfzcclruxf.supabase.co', 'sb_publishable_70s0Hd2anIQIHDt03kw35w_vZQhvYZk');

const { data: tpos } = await supabase.from('tpo').select('*').eq('tpo_time', '업무후').eq('tpo_place', '기계실/상황실').eq('tpo_occasion', '시설/안전 점검');
console.log('Target TPOs:', tpos);

if (tpos && tpos.length > 0) {
    const tpoIds = tpos.map(t => t.id);
    const { data: groups } = await supabase.from('task_groups').select('*, task_group_items(*)').in('tpo_id', tpoIds);
    console.log('Target Groups:', groups);
    
    const itemIds = groups.flatMap(g => g.task_group_items.map(tgi => tgi.checklist_item_id));
    const { data: items } = await supabase.from('checklist_items').select('*').in('id', itemIds);
    console.log('Target Items:', items);
}
