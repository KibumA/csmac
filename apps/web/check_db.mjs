import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data, error } = await supabase
    .from('tpo')
    .select('id, tpo_occasion, checklist_items(*)');

if (error) {
    console.error(error);
} else {
    data.forEach(t => {
        console.log(`TPO ID: ${t.id}, Occasion: ${t.tpo_occasion}, Items Count: ${t.checklist_items?.length || 0}`);
    });
}
