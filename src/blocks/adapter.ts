import { Block, BlockCategory, PayloadFieldConfig } from './types'
import { ReactNode } from 'react'

interface PayloadBlock {
  slug: string
  fields: PayloadFieldConfig[]
  version: string
  category?: string
  description?: string
  component?: React.ComponentType<any>
  admin?: {
    description?: string
    preview?: (data: any) => ReactNode
  }
}

type BlockField = PayloadFieldConfig

export const adaptPayloadBlockToBlock = (payloadBlock: PayloadBlock): Block => ({
  slug: payloadBlock.slug,
  fields: payloadBlock.fields,
  version: payloadBlock.version,
  category: payloadBlock.category || 'other',
  description: payloadBlock.description,
  admin: {
    description: payloadBlock.admin?.description || payloadBlock.description,
    preview: payloadBlock.admin?.preview || (() => null),
  }
})

export const adaptPayloadFieldToBlockField = (payloadField: PayloadFieldConfig): BlockField => ({
  ...payloadField
})

export const adaptBlockToPayloadBlock = (block: Block): PayloadBlock => ({
  slug: block.slug,
  fields: block.fields,
  version: block.version,
  category: block.category,
  description: block.description,
  admin: {
    description: block.admin?.description,
    preview: block.admin?.preview,
  }
})

export const adaptBlockFieldToPayloadField = (blockField: BlockField): PayloadFieldConfig => ({
  ...blockField
})
