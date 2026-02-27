import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ujdadumbtzdfzcclruxf.supabase.co', 'sb_publishable_70s0Hd2anIQIHDt03kw35w_vZQhvYZk');

const { data: items } = await supabase.from('checklist_items').select('*').eq('tpo_id', 54);
console.log('Items for TPO 54:', items);
