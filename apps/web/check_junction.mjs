import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ujdadumbtzdfzcclruxf.supabase.co', 'sb_publishable_70s0Hd2anIQIHDt03kw35w_vZQhvYZk');

const { data: junctions } = await supabase.from('task_group_items').select('*');
console.log('Junctions:', junctions);

const { data: groups } = await supabase.from('task_groups').select('id, tpo_id');
console.log('Groups:', groups);
