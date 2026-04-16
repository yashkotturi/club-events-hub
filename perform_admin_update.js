const { createClient } = require("./node_modules/@supabase/supabase-js");

const supabaseUrl = 'https://yjtxqawjjhuymffopltw.supabase.co';
const supabaseAnonKey = 'sb_publishable_GDUhmlyT2Pqa9de6J10AUQ_z3W4KiVz';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TARGET_USER_ID = '075c91f8-c4df-450a-a7f2-438800650a2d';

async function performUpdate() {
  console.log('--- STARTING ADMIN UPDATE ---');
  
  // 1. Update Profile Role
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'club_admin' })
    .eq('id', TARGET_USER_ID);

  if (profileError) {
    console.error('Error updating profile:', profileError);
    return;
  }
  console.log('✓ Profile role updated to club_admin');

  // 2. Assign some clubs to this user
  const clubsToAssign = [
    '74c839e2-0cfd-4f38-9d1a-552073bf15b7', // AIESEC MAHE
    'b717fa85-9662-4268-be80-1ca9afc08fad', // Leaders of tomorrow
    '6acaff0f-cce8-41d1-839d-7510ac41c064'  // ESOM
  ];

  const { error: clubError } = await supabase
    .from('clubs')
    .update({ admin_id: TARGET_USER_ID })
    .in('id', clubsToAssign);

  if (clubError) {
    console.error('Error updating clubs:', clubError);
    return;
  }
  console.log('✓ Clubs assigned to user');
  
  console.log('--- UPDATE COMPLETE ---');
}

performUpdate();
