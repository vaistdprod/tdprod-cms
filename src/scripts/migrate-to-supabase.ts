import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the SQL file
const sqlPath = path.join(__dirname, '..', 'migrations', '20250221_init_supabase_final3.sql')

console.log('='.repeat(80))
console.log('Please execute the following SQL in your Supabase SQL Editor:')
console.log('(Dashboard -> SQL Editor -> New Query)')
console.log('='.repeat(80))
console.log('\n')

// Output SQL with preserved formatting
const sqlContent = fs.readFileSync(sqlPath, { encoding: 'utf8', flag: 'r' })
console.log(sqlContent)
console.log('\n')
console.log('='.repeat(80))

// Instructions for next steps
console.log('\nAfter executing the SQL, please:')
console.log('1. Verify that all tables were created successfully')
console.log('2. Check that RLS policies are properly applied')
console.log('3. Test tenant isolation by creating test records')
console.log('4. Update your environment variables:')
console.log('   SUPABASE_URL=your-project-url')
console.log('   POSTGRES_PASSWORD=your-service-role-key')
console.log('\nNote: The service role key can be found in:')
console.log('Project Settings -> API -> Project API keys -> service_role')
