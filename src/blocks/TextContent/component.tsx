import React from 'react'
import { cn } from '@/lib/utils'
import { RichText } from '@payloadcms/richtext-lexical'

interface Style {
  textColor?: string
  backgroundColor?: string
  maxWidth: string
  padding: {
    top: string
    bottom: string
  }
  alignment: 'left' | 'center'
}

interface TextContentProps {
  content: any // Rich text content from Payload
  columns: '1' | '2'
  style: Style
  className?: string
}

export const TextContent: React.FC<TextContentProps> = ({
  content,
  columns,
  style,
  className,
}) => {
  return (
    <div 
      className={cn(
        'w-full',
        className
      )}
      style={{
        backgroundColor: style.backgroundColor,
        paddingTop: style.padding.top,
        paddingBottom: style.padding.bottom,
      }}
    >
      <div 
        className={cn(
          'container mx-auto px-4',
          columns === '2' ? 'columns-1 md:columns-2 gap-8' : ''
        )}
      >
        <div
          style={{
            color: style.textColor,
            maxWidth: columns === '1' ? style.maxWidth : 'none',
            marginLeft: style.alignment === 'center' ? 'auto' : undefined,
            marginRight: style.alignment === 'center' ? 'auto' : undefined,
            textAlign: style.alignment,
          }}
          className="prose prose-lg dark:prose-invert"
        >
          <RichText content={content} />
        </div>
      </div>
    </div>
  )
}
