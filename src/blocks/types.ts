import { ReactNode } from 'react'

export interface PayloadFieldConfig {
  name: string
  type: string
  required?: boolean
  label?: string
  defaultValue?: string | number | boolean | null
}

export interface VersionedBlockData {
  blockType: string
  version: string
  [key: string]: any
}

export interface BaseBlockVersion {
  version: string
  migrations?: {
    [fromVersion: string]: (data: any) => any
  }
}

export interface BaseBlock {
  slug: string
  fields: PayloadFieldConfig[]
  interfaceName?: string
  labels?: {
    singular: string
    plural: string
  }
  category?: string
  description?: string
  requiredFeature?: string
  version: string | number
  component?: React.ComponentType<any>
  admin?: {
    description?: string
    preview?: (data: any) => ReactNode
  }
}

export interface Block extends Omit<BaseBlock, 'version'> {
  version: string
}

export interface BlockInput extends BaseBlock {}

export type BlockConfig = Block

export interface BlockData {
  blockType: string
  version: string
  [key: string]: string | number | boolean | null | undefined
}

export interface BlockDataInput {
  blockType: string
  version: string | number
  [key: string]: string | number | boolean | null | undefined
}

export type BlockCategory = string

export interface VersionHistory {
  version: string
  changes: string[]
  date: string
  breaking?: boolean
}

export interface MigrationFunction {
  (data: any): any
}

export interface BlockValidation {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
  }>
}

export interface BlockMetadata {
  name: string
  category: string
  description: string
  requiredFeature?: string
  preview?: (data: any) => ReactNode
  version: string
  fields: Array<{
    name: string
    label: string
    type: string
    required: boolean
    defaultValue?: string | number | boolean | null
  }>
}

export interface ErrorBoundaryProps {
  fallback?: ReactNode
  children?: ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface BlockRegistry {
  [key: string]: {
    component: React.ComponentType<any>
    config: BlockInput
    versions: VersionHistory[]
    migrations: {
      [fromVersion: string]: MigrationFunction
    }
  }
}
