const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setRole() {
  const targetId = "075c91f8-c4df-450a-a7f2-438800650a2d"; // Test User
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('id', targetId);
  
  if (error) {
    console.error('Error updating role:', error);
  } else {
    console.log(`Role for user ${targetId} updated to super_admin`);
  }
}

setRole();
