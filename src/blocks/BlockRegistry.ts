import React from 'react'
import { HeroBlock } from './Hero/config'
import { TextContentBlock } from './TextContent/config'
import { TeamGridBlock } from './TeamGrid/config'
import { ServiceGridBlock } from './ServiceGrid/config'
import { ContactFormBlock } from './ContactForm/config'
import { TestimonialsGridBlock } from './TestimonialsGrid/config'
import { FAQBlock } from './FAQ/config'
import { Block, BlockData, BlockDataInput, BlockCategory, BlockMetadata, BlockValidation, BlockRegistry as BlockRegistryType } from './types'
import { adaptPayloadBlockToBlock } from './adapter'
import { VersionManager } from './versionManager'
import { BlockErrorBoundary } from './ErrorBoundary'

// Registry of all available blocks with versioning
export const blockRegistry: BlockRegistryType = {
  hero: {
    component: adaptPayloadBlockToBlock(HeroBlock).component!,
    config: {
      ...adaptPayloadBlockToBlock(HeroBlock),
      version: '1.0.0', // Initial version
      component: adaptPayloadBlockToBlock(HeroBlock).component,
    },
    versions: [
      {
        version: '1.0.0',
        changes: ['Initial release'],
        date: '2025-02-20',
      },
    ],
    migrations: {},
  },
  textContent: {
    component: adaptPayloadBlockToBlock(TextContentBlock).component!,
    config: {
      ...adaptPayloadBlockToBlock(TextContentBlock),
      version: '1.0.0',
      component: adaptPayloadBlockToBlock(TextContentBlock).component,
    },
    versions: [
      {
        version: '1.0.0',
        changes: ['Initial release'],
        date: '2025-02-20',
      },
    ],
    migrations: {},
  },
  teamGrid: {
    component: adaptPayloadBlockToBlock(TeamGridBlock).component!,
    config: {
      ...adaptPayloadBlockToBlock(TeamGridBlock),
      version: '1.0.0',
      component: adaptPayloadBlockToBlock(TeamGridBlock).component,
    },
    versions: [
      {
        version: '1.0.0',
        changes: ['Initial release'],
        date: '2025-02-20',
      },
    ],
    migrations: {},
  },
  serviceGrid: {
    component: adaptPayloadBlockToBlock(ServiceGridBlock).component!,
    config: {
      ...adaptPayloadBlockToBlock(ServiceGridBlock),
      version: '1.0.0',
      component: adaptPayloadBlockToBlock(ServiceGridBlock).component,
    },
    versions: [
      {
        version: '1.0.0',
        changes: ['Initial release'],
        date: '2025-02-20',
      },
    ],
    migrations: {},
  },
  contactForm: {
    component: adaptPayloadBlockToBlock(ContactFormBlock).component!,
    config: {
      ...adaptPayloadBlockToBlock(ContactFormBlock),
      version: '1.0.0',
      component: adaptPayloadBlockToBlock(ContactFormBlock).component,
    },
    versions: [
      {
        version: '1.0.0',
        changes: ['Initial release'],
        date: '2025-02-20',
      },
    ],
    migrations: {},
  },
  testimonialsGrid: {
    component: adaptPayloadBlockToBlock(TestimonialsGridBlock).component!,
    config: {
      ...adaptPayloadBlockToBlock(TestimonialsGridBlock),
      version: '1.0.0',
      component: adaptPayloadBlockToBlock(TestimonialsGridBlock).component,
    },
    versions: [
      {
        version: '1.0.0',
        changes: ['Initial release'],
        date: '2025-02-20',
      },
    ],
    migrations: {},
  },
  faq: {
    component: adaptPayloadBlockToBlock(FAQBlock).component!,
    config: {
      ...adaptPayloadBlockToBlock(FAQBlock),
      version: '1.0.0',
      component: adaptPayloadBlockToBlock(FAQBlock).component,
    },
    versions: [
      {
        version: '1.0.0',
        changes: ['Initial release'],
        date: '2025-02-20',
      },
    ],
    migrations: {},
  },
}

// Initialize version manager
export const versionManager = new VersionManager(blockRegistry)

// Type for block names
export type BlockName = keyof typeof blockRegistry

// Helper to convert BlockInput to Block
const ensureStringVersion = (block: BlockInput): Block => ({
  ...block,
  version: block.version.toString(),
})

// Helper to get block config
export const getBlockConfig = (name: BlockName): Block => {
  return ensureStringVersion(blockRegistry[name].config)
}

// Helper to get all blocks
export const getAllBlocks = (): Block[] => {
  return Object.values(blockRegistry).map(block => ensureStringVersion(block.config))
}

// Helper to get blocks by category
export const getBlocksByCategory = (category: BlockCategory): Block[] => {
  return Object.values(blockRegistry)
    .map(block => ensureStringVersion(block.config))
    .filter(block => block.category === category)
}

// Helper to get blocks by feature flag
export const getBlocksByFeature = (feature: string): Block[] => {
  return Object.values(blockRegistry)
    .map(block => ensureStringVersion(block.config))
    .filter(block => block.requiredFeature === feature)
}

// Helper to check if a block requires a specific feature
export const blockRequiresFeature = (blockName: BlockName, feature: string): boolean => {
  const block = blockRegistry[blockName].config
  return block.requiredFeature === feature
}

// Helper to validate block data
export const validateBlockData = (blockName: BlockName, data: BlockData): BlockValidation => {
  const block = blockRegistry[blockName].config
  const errors: Array<{ field: string; message: string }> = []

  // Version validation
  if (!data.version) {
    errors.push({
      field: 'version',
      message: 'Version is required',
    })
  } else if (typeof data.version !== 'string') {
    errors.push({
      field: 'version',
      message: 'Version must be a string',
    })
  }

  block.fields.forEach(field => {
    if (field.required && !data[field.name]) {
      errors.push({
        field: field.name,
        message: `${field.label || field.name} is required`,
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper to get default block data
export const getDefaultBlockData = (blockName: BlockName): BlockData => {
  const block = blockRegistry[blockName].config
  const defaultData: Record<string, any> = {
    blockType: blockName,
    version: block.version.toString(),
  }

  block.fields.forEach(field => {
    if (field.defaultValue !== undefined) {
      defaultData[field.name] = typeof field.defaultValue === 'number'
        ? field.defaultValue.toString()
        : field.defaultValue
    }
  })

  return defaultData as BlockData
}

// Helper to get block field
export const getBlockField = (blockName: BlockName, fieldName: string) => {
  const block = blockRegistry[blockName].config
  return block.fields.find(field => field.name === fieldName)
}

// Helper to check if block supports a specific field
export const blockSupportsField = (blockName: BlockName, fieldName: string): boolean => {
  return getBlockField(blockName, fieldName) !== undefined
}

// Helper to get all available block categories
export const getBlockCategories = (): BlockCategory[] => {
  const categories = new Set<BlockCategory>()
  Object.values(blockRegistry).forEach(block => {
    if (block.config.category) {
      categories.add(block.config.category)
    }
  })
  return Array.from(categories)
}

// Helper to get required features for a set of blocks
export const getRequiredFeatures = (blocks: BlockName[]): string[] => {
  const features = new Set<string>()
  blocks.forEach(blockName => {
    const block = blockRegistry[blockName].config
    if (block.requiredFeature) {
      features.add(block.requiredFeature)
    }
  })
  return Array.from(features)
}

// Helper to get block metadata
export const getBlockMetadata = (blockName: BlockName): BlockMetadata => {
  const block = ensureStringVersion(blockRegistry[blockName].config)
  return {
    name: blockName,
    category: block.category || 'other',
    description: block.description || '',
    requiredFeature: block.requiredFeature,
    preview: block.admin?.preview,
    version: block.version,
    fields: block.fields.map(field => ({
      name: field.name,
      label: field.label || field.name,
      type: field.type,
      required: !!field.required,
      defaultValue: field.defaultValue,
    })),
  }
}

// Helper to get version history for a block
export const getBlockVersionHistory = (blockName: BlockName) => {
  return blockRegistry[blockName].versions
}

// Helper to get a wrapped component with error boundary
export const getWrappedBlockComponent = (blockName: BlockName): React.FC<any> => {
  const BlockComponent = blockRegistry[blockName].component
  
  const WrappedComponent: React.FC<any> = (props) => {
    const fallbackElement = React.createElement(
      'div',
      { className: 'block-error p-4' },
      React.createElement(
        'p',
        null,
        `Error rendering ${blockName} block`
      )
    )

    return React.createElement(
      BlockErrorBoundary,
      {
        fallback: fallbackElement,
        children: React.createElement(BlockComponent, props)
      }
    )
  }

  return WrappedComponent
}
