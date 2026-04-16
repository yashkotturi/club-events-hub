const { createClient } = require("./node_modules/@supabase/supabase-js");

const supabaseUrl = 'https://yjtxqawjjhuymffopltw.supabase.co';
const supabaseAnonKey = 'sb_publishable_GDUhmlyT2Pqa9de6J10AUQ_z3W4KiVz';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log('--- PROFILES ---');
  data.forEach(profile => {
    console.log(`ID: ${profile.id} | Email: ${profile.email || 'N/A'} | Role: ${profile.role}`);
  });
}

listProfiles();
