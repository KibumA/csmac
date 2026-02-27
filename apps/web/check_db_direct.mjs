import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ujdadumbtzdfzcclruxf.supabase.co', 'sb_publishable_70s0Hd2anIQIHDt03kw35w_vZQhvYZk');

const { count: tpoCount } = await supabase.from('tpo').select('*', { count: 'exact', head: true });
const { count: itemCount } = await supabase.from('checklist_items').select('*', { count: 'exact', head: true });
const { count: groupCount } = await supabase.from('task_groups').select('*', { count: 'exact', head: true });
const { count: junctionCount } = await supabase.from('task_group_items').select('*', { count: 'exact', head: true });

console.log('TPO Count:', tpoCount);
console.log('Checklist Items Count:', itemCount);
console.log('Task Groups Count:', groupCount);
console.log('Task Group Items (Junction) Count:', junctionCount);

// Samples
const { data: items } = await supabase.from('checklist_items').select('*').limit(3);
console.log('Sample Items:', items);
