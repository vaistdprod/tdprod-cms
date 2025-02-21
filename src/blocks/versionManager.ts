import { VersionedBlockData, MigrationFunction, BlockRegistry, Block } from './types'
import semver from 'semver'

export class VersionManager {
  private registry: BlockRegistry

  constructor(registry: BlockRegistry) {
    this.registry = registry
  }

  /**
   * Migrate block data to the latest version if needed
   */
  migrateBlock(blockData: VersionedBlockData): VersionedBlockData {
    const blockType = blockData.blockType
    const blockInfo = this.registry[blockType]

    if (!blockInfo) {
      console.warn(`Unknown block type: ${blockType}`)
      return blockData
    }

    const currentVersion = blockData.version.toString()
    const latestVersion = blockInfo.config.version.toString()

    // If versions match or current version is higher (shouldn't happen), return as is
    if (!currentVersion || semver.gte(currentVersion, latestVersion)) {
      return blockData
    }

    // Find all applicable migrations
    const migrations = this.findMigrationPath(blockType, currentVersion, latestVersion)
    
    // Apply migrations in sequence
    let migratedData = { ...blockData }
    for (const migration of migrations) {
      try {
        migratedData = migration(migratedData)
      } catch (error) {
        console.error(`Migration failed for ${blockType}:`, error)
        // Return original data if migration fails
        return blockData
      }
    }

    // Update version to latest
    migratedData.version = latestVersion
    return migratedData
  }

  /**
   * Find the sequence of migrations needed to update from one version to another
   */
  private findMigrationPath(
    blockType: string,
    fromVersion: string,
    toVersion: string
  ): MigrationFunction[] {
    const blockInfo = this.registry[blockType]
    const migrations: MigrationFunction[] = []

    if (!blockInfo?.migrations) {
      return migrations
    }

    // Convert versions to strings for semver operations
    const fromVersionStr = fromVersion.toString()
    const toVersionStr = toVersion.toString()

    // Get all available versions for this block
    const versions = Object.keys(blockInfo.migrations)
      .map(v => v.split('->')[0])
      .concat([toVersionStr])
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort(semver.compare)

    // Find the path from fromVersion to toVersion
    let currentVersion = fromVersionStr
    while (semver.lt(currentVersion, toVersionStr)) {
      const nextVersion = versions.find(v => semver.gt(v, currentVersion))
      if (!nextVersion) break

      const migrationKey = `${currentVersion}->${nextVersion}`
      const migration = blockInfo.migrations[migrationKey]
      
      if (migration) {
        migrations.push(migration)
      }
      
      currentVersion = nextVersion
    }

    return migrations
  }

  /**
   * Validate block data against its schema
   */
  validateBlock(blockData: VersionedBlockData): boolean {
    const blockInfo = this.registry[blockData.blockType]
    if (!blockInfo) return false

    // Basic validation
    if (!blockData.version || !semver.valid(blockData.version)) {
      return false
    }

    // Add more validation as needed
    return true
  }

  /**
   * Get fallback component for a block type
   */
  getFallbackComponent(blockType: string): React.ComponentType<any> | null {
    const blockInfo = this.registry[blockType]
    return blockInfo?.config?.admin?.preview || null
  }
}
