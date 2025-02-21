import React, { ElementType } from 'react';
import { ComponentImplementation, ComponentProps } from '../../core/types';

export interface BoxProps extends ComponentProps {
  as?: ElementType;
  children?: React.ReactNode;
  padding?: string | number;
  margin?: string | number;
  width?: string | number;
  height?: string | number;
  background?: string;
  border?: string;
  borderRadius?: string | number;
  shadow?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid';
  overflow?: string;
  cursor?: string;
  opacity?: number;
  transform?: string;
  transition?: string;
  zIndex?: number;
}

const Box: ComponentImplementation<BoxProps> = {
  id: 'Box',
  category: 'layout',
  schema: {
    as: {
      type: 'text',
      defaultValue: 'div',
    },
    padding: {
      type: 'text',
    },
    margin: {
      type: 'text',
    },
    width: {
      type: 'text',
    },
    height: {
      type: 'text',
    },
    background: {
      type: 'text',
    },
    border: {
      type: 'text',
    },
    borderRadius: {
      type: 'text',
    },
    shadow: {
      type: 'text',
    },
    position: {
      type: 'select',
      options: [
        { label: 'Static', value: 'static' },
        { label: 'Relative', value: 'relative' },
        { label: 'Absolute', value: 'absolute' },
        { label: 'Fixed', value: 'fixed' },
        { label: 'Sticky', value: 'sticky' },
      ],
    },
    display: {
      type: 'select',
      options: [
        { label: 'Block', value: 'block' },
        { label: 'Inline', value: 'inline' },
        { label: 'Inline Block', value: 'inline-block' },
        { label: 'Flex', value: 'flex' },
        { label: 'Inline Flex', value: 'inline-flex' },
        { label: 'Grid', value: 'grid' },
        { label: 'Inline Grid', value: 'inline-grid' },
      ],
    },
    overflow: {
      type: 'text',
    },
    cursor: {
      type: 'text',
    },
    opacity: {
      type: 'number',
      min: 0,
      max: 1,
    },
    transform: {
      type: 'text',
    },
    transition: {
      type: 'text',
    },
    zIndex: {
      type: 'number',
    },
  },
  defaultProps: {
    as: 'div',
  },
  variants: {
    card: {
      props: {
        padding: '1rem',
        background: 'white',
        borderRadius: 'md',
        shadow: 'md',
      },
    },
    outline: {
      props: {
        border: '1px solid',
        borderRadius: 'base',
      },
    },
  },
  render: ({
    as: Component = 'div' as ElementType,
    style,
    children,
    padding,
    margin,
    width,
    height,
    background,
    border,
    borderRadius,
    shadow,
    position,
    display,
    overflow,
    cursor,
    opacity,
    transform,
    transition,
    zIndex,
    ...props
  }) => {
    const computedStyle: React.CSSProperties = {
      padding,
      margin,
      width,
      height,
      background,
      border,
      borderRadius,
      boxShadow: shadow,
      position,
      display,
      overflow,
      cursor,
      opacity,
      transform,
      transition,
      zIndex,
      ...style,
    };

    return (
      <Component 
        style={computedStyle} 
        {...props}
      >
        {children}
      </Component>
    );
  },
};

import { createComponent } from '../../core/createComponent';

// Create the React component
export default createComponent(Box);
