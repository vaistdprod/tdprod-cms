import React, { ElementType } from 'react';
import { ComponentImplementation, ComponentProps } from '../../core/types';
import { BoxProps } from './Box';
import { createComponent } from '../../core/createComponent';
import { componentRegistry } from '../../core/ComponentRegistry';

export interface GridProps extends ComponentProps {
  as?: ElementType;
  children?: React.ReactNode;
  columns?: number | string | { [key: string]: number | string };
  rows?: number | string | { [key: string]: number | string };
  gap?: string | number | { column?: string | number; row?: string | number };
  autoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  autoColumns?: string;
  autoRows?: string;
  templateAreas?: string;
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around';
  justifyContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around';
  responsive?: {
    sm?: Partial<GridProps>;
    md?: Partial<GridProps>;
    lg?: Partial<GridProps>;
    xl?: Partial<GridProps>;
  };
}

const Grid: ComponentImplementation<GridProps> = {
  id: 'Grid',
  category: 'layout',
  schema: {
    as: {
      type: 'text',
      defaultValue: 'div',
    },
    columns: {
      type: 'text',
    },
    rows: {
      type: 'text',
    },
    gap: {
      type: 'text',
    },
    autoFlow: {
      type: 'select',
      options: [
        { label: 'Row', value: 'row' },
        { label: 'Column', value: 'column' },
        { label: 'Row Dense', value: 'row dense' },
        { label: 'Column Dense', value: 'column dense' },
      ],
    },
    autoColumns: {
      type: 'text',
    },
    autoRows: {
      type: 'text',
    },
    templateAreas: {
      type: 'text',
    },
    alignItems: {
      type: 'select',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'End', value: 'end' },
        { label: 'Center', value: 'center' },
        { label: 'Stretch', value: 'stretch' },
      ],
    },
    justifyItems: {
      type: 'select',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'End', value: 'end' },
        { label: 'Center', value: 'center' },
        { label: 'Stretch', value: 'stretch' },
      ],
    },
    alignContent: {
      type: 'select',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'End', value: 'end' },
        { label: 'Center', value: 'center' },
        { label: 'Stretch', value: 'stretch' },
        { label: 'Space Between', value: 'space-between' },
        { label: 'Space Around', value: 'space-around' },
      ],
    },
    justifyContent: {
      type: 'select',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'End', value: 'end' },
        { label: 'Center', value: 'center' },
        { label: 'Stretch', value: 'stretch' },
        { label: 'Space Between', value: 'space-between' },
        { label: 'Space Around', value: 'space-around' },
      ],
    },
    responsive: {
      type: 'object',
      fields: {
        sm: {
          type: 'object',
          fields: {
            columns: { type: 'text' },
            rows: { type: 'text' },
            gap: { type: 'text' },
          },
        },
        md: {
          type: 'object',
          fields: {
            columns: { type: 'text' },
            rows: { type: 'text' },
            gap: { type: 'text' },
          },
        },
        lg: {
          type: 'object',
          fields: {
            columns: { type: 'text' },
            rows: { type: 'text' },
            gap: { type: 'text' },
          },
        },
        xl: {
          type: 'object',
          fields: {
            columns: { type: 'text' },
            rows: { type: 'text' },
            gap: { type: 'text' },
          },
        },
      },
    },
  },
  defaultProps: {
    as: 'div',
    columns: 1,
    gap: '1rem',
  },
  variants: {
    twoColumn: {
      props: {
        columns: 2,
        gap: '2rem',
      },
    },
    threeColumn: {
      props: {
        columns: 3,
        gap: '2rem',
      },
    },
    fourColumn: {
      props: {
        columns: 4,
        gap: '2rem',
      },
    },
    responsive: {
      props: {
        columns: {
          sm: 1,
          md: 2,
          lg: 3,
          xl: 4,
        },
        gap: '2rem',
      },
    },
  },
  render: ({
    as,
    style,
    children,
    columns = 1,
    rows,
    gap,
    autoFlow,
    autoColumns,
    autoRows,
    templateAreas,
    alignItems,
    justifyItems,
    alignContent,
    justifyContent,
    responsive,
    ...props
  }) => {
    const BoxComponent = componentRegistry.getComponent<BoxProps>('Box')!.render;

    // Process columns prop
    const processColumns = (cols: number | string | { [key: string]: number | string }): string => {
      if (typeof cols === 'number') {
        return `repeat(${cols}, 1fr)`;
      }
      if (typeof cols === 'string') {
        return cols;
      }
      // Convert object to string representation
      return Object.entries(cols)
        .map(([key, value]) => typeof value === 'number' ? `repeat(${value}, 1fr)` : value)
        .join(' ');
    };

    // Process gap prop
    const processGap = (g: string | number | { column?: string | number; row?: string | number }): React.CSSProperties => {
      if (typeof g === 'object') {
        return {
          columnGap: typeof g.column === 'number' ? `${g.column}px` : g.column,
          rowGap: typeof g.row === 'number' ? `${g.row}px` : g.row,
        };
      }
      return { gap: typeof g === 'number' ? `${g}px` : g };
    };

    // Build responsive styles
    const mediaQueries = responsive
      ? Object.entries(responsive).reduce<Record<string, React.CSSProperties>>((acc, [breakpoint, values]) => {
          const minWidth = {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
          }[breakpoint];

          if (minWidth && Object.keys(values).length > 0) {
            acc[`@media (min-width: ${minWidth})`] = {
              gridTemplateColumns: values.columns ? processColumns(values.columns) : undefined,
              gridTemplateRows: values.rows ? processColumns(values.rows) : undefined,
              ...(values.gap ? processGap(values.gap) : {}),
            };
          }

          return acc;
        }, {})
      : {};

    const computedStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: processColumns(columns),
      gridTemplateRows: rows ? processColumns(rows) : undefined,
      gridAutoFlow: autoFlow,
      gridAutoColumns: autoColumns,
      gridAutoRows: autoRows,
      gridTemplateAreas: templateAreas,
      alignItems,
      justifyItems,
      alignContent,
      justifyContent,
      ...processGap(gap || 0),
      ...mediaQueries,
      ...style,
    };

    return BoxComponent({
      as,
      style: computedStyle,
      children,
      ...props,
    });
  },
};

// Create the React component
export default createComponent(Grid);
