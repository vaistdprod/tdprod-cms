import React from 'react'
import { BlockPreviewProps, BlockData } from '../types'

interface HeroData extends BlockData {
  heading: string
  subheading?: string
  backgroundImage?: {
    url: string
    alt?: string
  }
  style?: {
    textAlignment?: 'left' | 'center' | 'right'
    height?: 'small' | 'medium' | 'large' | 'full'
    padding?: {
      top?: string
      bottom?: string
    }
  }
  buttons?: Array<{
    label: string
    link: string
    style?: 'primary' | 'secondary' | 'text'
  }>
}

interface HeroPreviewProps extends BlockPreviewProps {
  data: HeroData
}

export const HeroPreview: React.FC<HeroPreviewProps> = ({ data, readOnly }) => {
  const {
    heading,
    subheading,
    backgroundImage,
    style = {},
    buttons = [],
  } = data

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Hero Block</h3>
          {!readOnly && (
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
              Click to edit
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Heading
            </label>
            <div className="mt-1 text-sm text-gray-900">{heading}</div>
          </div>

          {subheading && (
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Subheading
              </label>
              <div className="mt-1 text-sm text-gray-900">{subheading}</div>
            </div>
          )}

          {backgroundImage && (
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Background Image
              </label>
              <div className="mt-1">
                <img
                  src={backgroundImage.url}
                  alt={backgroundImage.alt || ''}
                  className="h-20 w-32 object-cover rounded"
                />
              </div>
            </div>
          )}

          {buttons.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Buttons
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                {buttons.map((button, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                  >
                    {button.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500">
              Style
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Alignment:</span>{' '}
                {style.textAlignment || 'center'}
              </div>
              <div>
                <span className="font-medium">Height:</span>{' '}
                {style.height || 'medium'}
              </div>
              <div>
                <span className="font-medium">Top Padding:</span>{' '}
                {style.padding?.top || '4rem'}
              </div>
              <div>
                <span className="font-medium">Bottom Padding:</span>{' '}
                {style.padding?.bottom || '4rem'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroPreview
