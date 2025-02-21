import { Block as PayloadBlock, Field } from 'payload/types'
import { Block, BlockField, BlockCategory } from './types'

export const adaptPayloadBlockToBlock = (payloadBlock: PayloadBlock): Block => {
  return {
    slug: payloadBlock.slug || '',
    fields: payloadBlock.fields.map(adaptPayloadFieldToBlockField),
    category: payloadBlock.admin?.group as BlockCategory || 'other',
    description: payloadBlock.admin?.description,
    admin: {
      description: payloadBlock.admin?.description,
      preview: false,
    },
  }
}

export const adaptPayloadFieldToBlockField = (payloadField: Field): BlockField => {
  return {
    name: payloadField.name as string,
    type: payloadField.type,
    label: typeof payloadField.label === 'string' ? payloadField.label : undefined,
    required: !!payloadField.required,
    defaultValue: 'defaultValue' in payloadField ? payloadField.defaultValue : undefined,
    admin: {
      description: payloadField.admin?.description,
      condition: payloadField.admin?.condition,
    },
  }
}

export const adaptBlockToPayloadBlock = (block: Block): PayloadBlock => {
  return {
    slug: block.slug,
    fields: block.fields.map(adaptBlockFieldToPayloadField),
    admin: {
      description: block.description,
      group: block.category,
    },
  }
}

export const adaptBlockFieldToPayloadField = (blockField: BlockField): Field => {
  return {
    name: blockField.name,
    type: blockField.type,
    label: blockField.label,
    required: blockField.required,
    defaultValue: blockField.defaultValue,
    admin: blockField.admin,
  } as Field
}
