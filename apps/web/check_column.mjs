import { createClient } from '@supabase/supabase-api';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('job_instructions').select('*').limit(1);
if (error) console.error(error);
else console.log(Object.keys(data[0]));
