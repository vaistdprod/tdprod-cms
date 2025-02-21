import React from 'react'
import { BlockData } from '../types'

interface HeroProps {
  data: BlockData & {
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
}

export const Hero: React.FC<HeroProps> = ({ data }) => {
  const {
    heading,
    subheading,
    backgroundImage,
    style = {},
    buttons = [],
  } = data

  const {
    textAlignment = 'center',
    height = 'medium',
    padding = { top: '4rem', bottom: '4rem' },
  } = style

  const heightMap = {
    small: '50vh',
    medium: '75vh',
    large: '90vh',
    full: '100vh',
  }

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        minHeight: heightMap[height],
        paddingTop: padding.top,
        paddingBottom: padding.bottom,
      }}
    >
      {backgroundImage?.url && (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage.url}
            alt={backgroundImage.alt || ''}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
        </div>
      )}

      <div 
        className="relative z-10 container mx-auto px-4"
        style={{ textAlign: textAlignment }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
          {heading}
        </h1>
        
        {subheading && (
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            {subheading}
          </p>
        )}

        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            {buttons.map((button, index) => {
              const buttonStyles = {
                primary: 'bg-primary text-white hover:bg-primary/90',
                secondary: 'bg-white text-primary hover:bg-gray-100',
                text: 'text-white hover:underline',
              }

              return (
                <a
                  key={index}
                  href={button.link}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all
                    ${buttonStyles[button.style || 'primary']}
                  `}
                >
                  {button.label}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero
