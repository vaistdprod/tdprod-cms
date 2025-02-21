import { startDomainVerificationChecker } from './utilities/checkDomainVerification'

let domainCheckerCleanup: (() => void) | null = null

export async function initializeServer() {
  try {
    // Start domain verification checker
    domainCheckerCleanup = await startDomainVerificationChecker()

    console.log('Server initialization completed')
  } catch (error) {
    console.error('Server initialization error:', error)
  }
}

export async function cleanupServer() {
  if (domainCheckerCleanup) {
    domainCheckerCleanup()
    domainCheckerCleanup = null
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...')
  await cleanupServer()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received. Cleaning up...')
  await cleanupServer()
  process.exit(0)
})
