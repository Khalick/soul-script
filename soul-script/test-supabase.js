import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hiofxbwylcutjskupbyc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpb2Z4Ynd5bGN1dGpza3VwYnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODAxMzEsImV4cCI6MjA4MDc1NjEzMX0.MCXg4DTT1Hqk05Z1sAnuGkKcUBiRssierpiP3q81BTE'
);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Check if users table exists
  const { data, error } = await supabase.from('users').select('count').limit(1);
  
  if (error) {
    console.log('❌ Database tables not set up yet');
    console.log('Error:', error.message);
    return false;
  }
  
  console.log('✅ Connection successful! Tables exist.');
  return true;
}

testConnection();
