import React, { ElementType } from 'react';
import { ComponentImplementation, ComponentProps } from '../../core/types';
import { BoxProps } from './Box';
import { createComponent } from '../../core/createComponent';
import { componentRegistry } from '../../core/ComponentRegistry';

export interface StackProps extends ComponentProps {
  as?: ElementType;
  children?: React.ReactNode;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  spacing?: string | number;
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string | number;
  dividers?: boolean;
  dividerColor?: string;
  responsive?: {
    sm?: Partial<StackProps>;
    md?: Partial<StackProps>;
    lg?: Partial<StackProps>;
    xl?: Partial<StackProps>;
  };
}

const Stack: ComponentImplementation<StackProps> = {
  id: 'Stack',
  category: 'layout',
  schema: {
    as: {
      type: 'text',
      defaultValue: 'div',
    },
    direction: {
      type: 'select',
      options: [
        { label: 'Row', value: 'row' },
        { label: 'Row Reverse', value: 'row-reverse' },
        { label: 'Column', value: 'column' },
        { label: 'Column Reverse', value: 'column-reverse' },
      ],
    },
    spacing: {
      type: 'text',
    },
    align: {
      type: 'select',
      options: [
        { label: 'Start', value: 'flex-start' },
        { label: 'End', value: 'flex-end' },
        { label: 'Center', value: 'center' },
        { label: 'Baseline', value: 'baseline' },
        { label: 'Stretch', value: 'stretch' },
      ],
    },
    justify: {
      type: 'select',
      options: [
        { label: 'Start', value: 'flex-start' },
        { label: 'End', value: 'flex-end' },
        { label: 'Center', value: 'center' },
        { label: 'Space Between', value: 'space-between' },
        { label: 'Space Around', value: 'space-around' },
        { label: 'Space Evenly', value: 'space-evenly' },
      ],
    },
    wrap: {
      type: 'select',
      options: [
        { label: 'No Wrap', value: 'nowrap' },
        { label: 'Wrap', value: 'wrap' },
        { label: 'Wrap Reverse', value: 'wrap-reverse' },
      ],
    },
    gap: {
      type: 'text',
    },
    dividers: {
      type: 'boolean',
    },
    dividerColor: {
      type: 'text',
    },
    responsive: {
      type: 'object',
      fields: {
        sm: {
          type: 'object',
          fields: {
            direction: { type: 'text' },
            spacing: { type: 'text' },
            align: { type: 'text' },
            justify: { type: 'text' },
            wrap: { type: 'text' },
          },
        },
        md: {
          type: 'object',
          fields: {
            direction: { type: 'text' },
            spacing: { type: 'text' },
            align: { type: 'text' },
            justify: { type: 'text' },
            wrap: { type: 'text' },
          },
        },
        lg: {
          type: 'object',
          fields: {
            direction: { type: 'text' },
            spacing: { type: 'text' },
            align: { type: 'text' },
            justify: { type: 'text' },
            wrap: { type: 'text' },
          },
        },
        xl: {
          type: 'object',
          fields: {
            direction: { type: 'text' },
            spacing: { type: 'text' },
            align: { type: 'text' },
            justify: { type: 'text' },
            wrap: { type: 'text' },
          },
        },
      },
    },
  },
  defaultProps: {
    as: 'div',
    direction: 'column',
    align: 'stretch',
    justify: 'flex-start',
    wrap: 'nowrap',
    dividers: false,
  },
  variants: {
    row: {
      props: {
        direction: 'row',
        spacing: '1rem',
      },
    },
    column: {
      props: {
        direction: 'column',
        spacing: '1rem',
      },
    },
    centered: {
      props: {
        align: 'center',
        justify: 'center',
      },
    },
    spaceBetween: {
      props: {
        direction: 'row',
        justify: 'space-between',
        align: 'center',
      },
    },
  },
  render: ({
    as,
    style,
    children,
    direction = 'column',
    spacing,
    align,
    justify,
    wrap,
    gap,
    dividers,
    dividerColor = 'currentColor',
    responsive,
    ...props
  }) => {
    const BoxComponent = componentRegistry.getComponent<BoxProps>('Box')!.render;

    // Process children to add dividers
    const processedChildren = React.Children.toArray(children).reduce<React.ReactNode[]>(
      (acc, child, index, array) => {
        if (!React.isValidElement(child)) return acc;

        acc.push(child);

        if (dividers && index < array.length - 1) {
          const isHorizontal = direction.includes('row');
          const dividerStyle: React.CSSProperties = {
            backgroundColor: dividerColor,
            ...(isHorizontal
              ? {
                  width: '1px',
                  alignSelf: 'stretch',
                }
              : {
                  height: '1px',
                  width: '100%',
                }),
          };

          acc.push(
            BoxComponent({
              key: `divider-${index}`,
              style: dividerStyle,
              margin: spacing,
            })
          );
        }

        return acc;
      },
      []
    );

    // Build responsive styles
    const mediaQueries = responsive
      ? Object.entries(responsive).reduce((acc, [breakpoint, values]) => {
          const minWidth = {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
          }[breakpoint];

          if (minWidth && Object.keys(values).length > 0) {
            acc[`@media (min-width: ${minWidth})`] = {
              flexDirection: values.direction,
              alignItems: values.align,
              justifyContent: values.justify,
              flexWrap: values.wrap,
              gap: values.spacing,
            };
          }

          return acc;
        }, {} as Record<string, React.CSSProperties>)
      : {};

    const computedStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap,
      gap,
      ...mediaQueries,
      ...style,
    };

    return BoxComponent({
      as,
      style: computedStyle,
      children: processedChildren,
      ...props,
    });
  },
};

// Create the React component
export default createComponent(Stack);
