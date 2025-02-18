import React from 'react'
import { cn } from '@/lib/utils'

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
  content: {
    root: {
      children: Array<{
        text?: string
        type?: string
        [key: string]: any
      }>
    }
  }
  columns: '1' | '2'
  style: Style
  className?: string
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const renderNode = (node: any): React.ReactNode => {
  if (typeof node === 'string') return node
  if (!node) return null

  if (node.text) {
    let content = node.text
    if (node.bold) content = <strong key={content}>{content}</strong>
    if (node.italic) content = <em key={content}>{content}</em>
    if (node.underline) content = <u key={content}>{content}</u>
    return content
  }

  if (node.type === 'paragraph') {
    return (
      <p key={Math.random()}>
        {node.children?.map((child: any, index: number) => (
          <React.Fragment key={index}>
            {renderNode(child)}
          </React.Fragment>
        ))}
      </p>
    )
  }

  if (node.type === 'heading') {
    const HeadingComponent = React.createElement(
      `h${node.tag}` as HeadingTag,
      { key: Math.random() },
      node.children?.map((child: any, index: number) => (
        <React.Fragment key={index}>
          {renderNode(child)}
        </React.Fragment>
      ))
    )
    return HeadingComponent
  }

  if (node.type === 'list') {
    const ListComponent = node.listType === 'ordered' ? 'ol' : 'ul'
    return React.createElement(
      ListComponent,
      { key: Math.random() },
      node.children?.map((child: any, index: number) => (
        <React.Fragment key={index}>
          {renderNode(child)}
        </React.Fragment>
      ))
    )
  }

  if (node.type === 'listitem') {
    return (
      <li key={Math.random()}>
        {node.children?.map((child: any, index: number) => (
          <React.Fragment key={index}>
            {renderNode(child)}
          </React.Fragment>
        ))}
      </li>
    )
  }

  if (node.children) {
    return node.children.map((child: any, index: number) => (
      <React.Fragment key={index}>
        {renderNode(child)}
      </React.Fragment>
    ))
  }

  return null
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
          {content?.root?.children?.map((node, index) => (
            <React.Fragment key={index}>
              {renderNode(node)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
