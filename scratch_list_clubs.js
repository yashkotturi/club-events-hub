const { createClient } = require("./node_modules/@supabase/supabase-js");

const supabaseUrl = 'https://yjtxqawjjhuymffopltw.supabase.co';
const supabaseAnonKey = 'sb_publishable_GDUhmlyT2Pqa9de6J10AUQ_z3W4KiVz';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listClubs() {
  const { data, error } = await supabase
    .from('clubs')
    .select('id, name, admin_id');

  if (error) {
    console.error('Error fetching clubs:', error);
    return;
  }

  console.log('--- CLUBS ---');
  data.forEach(club => {
    console.log(`ID: ${club.id} | Name: ${club.name} | AdminID: ${club.admin_id}`);
  });
}

listClubs();
