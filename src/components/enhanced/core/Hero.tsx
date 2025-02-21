import React from 'react';
import { ComponentImplementation } from '../types';
import { componentRegistry } from '../ComponentRegistry';

const Hero: ComponentImplementation = {
  id: 'hero',
  name: 'Hero Section',
  category: 'core',
  version: '1.0.0',
  description: 'A versatile hero section component with background image support',
  schema: {
    heading: { type: 'text', required: true },
    subheading: { type: 'text' },
    backgroundImage: { type: 'upload', relationTo: 'media' },
    ctaButton: {
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'link', type: 'text' },
        { name: 'style', type: 'select', options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
        ]},
      ],
    },
    alignment: {
      type: 'select',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      defaultValue: 'center',
    },
  },
  defaultProps: {
    style: {
      height: '70vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      overflow: 'hidden',
      backgroundColor: 'var(--background)',
    },
  },
  variants: {
    fullscreen: {
      style: {
        height: '100vh',
        padding: '4rem 2rem',
      },
    },
    minimal: {
      style: {
        height: '50vh',
        padding: '2rem',
      },
    },
    overlay: {
      style: {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        },
      },
      props: {
        contentStyle: {
          position: 'relative',
          zIndex: 2,
          color: '#ffffff',
        },
      },
    },
  },
  render: ({ props }) => {
    const {
      heading,
      subheading,
      backgroundImage,
      ctaButton,
      alignment = 'center',
      style,
      contentStyle = {},
    } = props;

    const containerStyle = {
      ...style,
      ...(backgroundImage && {
        backgroundImage: `url(${backgroundImage.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }),
    };

    const textAlignStyle = {
      textAlign: alignment,
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      ...contentStyle,
    };

    const getButtonClassName = (buttonStyle = 'primary') => {
      const baseClass = 'px-6 py-3 rounded-lg font-medium transition-colors duration-200';
      switch (buttonStyle) {
        case 'secondary':
          return `${baseClass} bg-secondary text-white hover:bg-secondary-dark`;
        case 'outline':
          return `${baseClass} border-2 border-primary text-primary hover:bg-primary hover:text-white`;
        default:
          return `${baseClass} bg-primary text-white hover:bg-primary-dark`;
      }
    };

    return (
      <div style={containerStyle}>
        <div style={textAlignStyle}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {heading}
          </h1>
          {subheading && (
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {subheading}
            </p>
          )}
          {ctaButton && ctaButton.label && ctaButton.link && (
            <a
              href={ctaButton.link}
              className={getButtonClassName(ctaButton.style)}
            >
              {ctaButton.label}
            </a>
          )}
        </div>
      </div>
    );
  },
};

// Register the component
componentRegistry.registerComponent(Hero);

export default Hero;
