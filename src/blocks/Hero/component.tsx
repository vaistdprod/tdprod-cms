import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type ButtonStyle = 'primary' | 'secondary' | 'text'

interface Button {
  label: string
  link: string
  style: ButtonStyle
}

interface Style {
  textColor?: string
  backgroundColor?: string
  textAlignment: 'left' | 'center' | 'right'
  padding: {
    top: string
    bottom: string
  }
}

interface HeroProps {
  heading: string
  subheading?: string
  backgroundImage?: {
    url: string
    width: number
    height: number
    alt: string
  }
  buttons?: Button[]
  style: Style
  className?: string
}

export const Hero: React.FC<HeroProps> = ({
  heading,
  subheading,
  backgroundImage,
  buttons,
  style,
  className,
}) => {
  const containerStyle = {
    color: style.textColor,
    backgroundColor: style.backgroundColor,
    paddingTop: style.padding.top,
    paddingBottom: style.padding.bottom,
    textAlign: style.textAlignment,
  } as React.CSSProperties

  const buttonStyles: Record<ButtonStyle, string> = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-primary hover:bg-secondary/90',
    text: 'text-primary hover:underline',
  }

  return (
    <div 
      className={cn(
        'relative w-full overflow-hidden',
        className
      )}
      style={containerStyle}
    >
      {backgroundImage && (
        <Image
          src={backgroundImage.url}
          alt={backgroundImage.alt}
          width={backgroundImage.width}
          height={backgroundImage.height}
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      )}
      
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {heading}
        </h1>
        
        {subheading && (
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {subheading}
          </p>
        )}
        
        {buttons && buttons.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            {buttons.map((button, index) => (
              <a
                key={index}
                href={button.link}
                className={cn(
                  'px-6 py-2 rounded-full transition-colors',
                  buttonStyles[button.style]
                )}
              >
                {button.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
