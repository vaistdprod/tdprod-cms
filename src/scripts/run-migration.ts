import { config } from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env file
config({ path: path.join(__dirname, '../../.env') })

// Import and run the migration script
import('./migrate-to-supabase.ts')
