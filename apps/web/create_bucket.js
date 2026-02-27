const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const dotenv = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const env = dotenv.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
// Use service_role key to bypass policies when creating buckets
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
      console.error('Error listing buckets:', listError);
      return;
  }
  
  if (buckets.find(b => b.name === 'evidence-photos')) {
    console.log('Bucket "evidence-photos" already exists!');
    return;
  }

  const { data, error } = await supabase.storage.createBucket('evidence-photos', {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 10485760 // 10MB
  });
  
  if (error) {
    console.error('Error creating bucket:', error);
  } else {
    console.log('Successfully created bucket:', data);
  }
}

createBucket();
