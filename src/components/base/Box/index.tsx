import React, { ElementType, forwardRef } from 'react'
import type { CSSProperties } from 'react'
import { ContainerProps } from '../types'
import { useTheme, createStyles } from '../ThemeProvider'
import { cn, toCSSUnit } from '../utils'

export type DisplayValue = 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid'
export type FlexDirectionValue = 'row' | 'row-reverse' | 'column' | 'column-reverse'

export interface BoxBaseProps extends Omit<ContainerProps, 'gap'> {
  as?: ElementType
  padding?: keyof ReturnType<typeof createStyles>['spacing']
  margin?: keyof ReturnType<typeof createStyles>['spacing']
  borderRadius?: keyof ReturnType<typeof createStyles>['rounded']
  shadow?: keyof ReturnType<typeof createStyles>['shadow']
  backgroundColor?: keyof ReturnType<typeof createStyles>['bg']
  color?: keyof ReturnType<typeof createStyles>['color']
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  display?: DisplayValue
  flexDirection?: FlexDirectionValue
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  flex?: string | number
  gap?: keyof ReturnType<typeof createStyles>['spacing'] | undefined
  order?: number
  gridTemplateColumns?: string
  gridTemplateRows?: string
  gridColumn?: string
  gridRow?: string
  cursor?: string
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  transition?: keyof ReturnType<typeof createStyles>['transition']
  transform?: string
  opacity?: number
  version?: string
}

export interface BoxProps extends BoxBaseProps {}

type StyleProps = Pick<BoxProps,
  | 'padding'
  | 'margin'
  | 'borderRadius'
  | 'shadow'
  | 'backgroundColor'
  | 'color'
  | 'width'
  | 'height'
  | 'minWidth'
  | 'minHeight'
  | 'maxWidth'
  | 'maxHeight'
  | 'position'
  | 'display'
  | 'flexDirection'
  | 'flexWrap'
  | 'justifyContent'
  | 'alignItems'
  | 'alignSelf'
  | 'flex'
  | 'gap'
  | 'order'
  | 'gridTemplateColumns'
  | 'gridTemplateRows'
  | 'gridColumn'
  | 'gridRow'
  | 'cursor'
  | 'overflow'
  | 'transition'
  | 'transform'
  | 'opacity'
>

type BoxComponent = {
  <T extends ElementType = 'div'>(
    props: BoxProps & { as?: T } & Omit<React.ComponentPropsWithRef<T>, keyof BoxProps>
  ): React.ReactElement | null
  displayName?: string
}

function createStyleObject(styleProps: StyleProps, theme: ReturnType<typeof useTheme>, styles: ReturnType<typeof createStyles>): CSSProperties {
  const styleObject: Partial<CSSProperties> & Record<string, unknown> = {}

  if (styleProps.padding) Object.assign(styleObject, styles.spacing(styleProps.padding))
  if (styleProps.margin) Object.assign(styleObject, styles.margin(styleProps.margin))
  if (styleProps.borderRadius) Object.assign(styleObject, styles.rounded(styleProps.borderRadius))
  if (styleProps.shadow) Object.assign(styleObject, styles.shadow(styleProps.shadow))
  if (styleProps.backgroundColor) Object.assign(styleObject, styles.bg(styleProps.backgroundColor))
  if (styleProps.color) Object.assign(styleObject, styles.color(styleProps.color))
  if (styleProps.width !== undefined) styleObject.width = toCSSUnit(styleProps.width)
  if (styleProps.height !== undefined) styleObject.height = toCSSUnit(styleProps.height)
  if (styleProps.minWidth !== undefined) styleObject.minWidth = toCSSUnit(styleProps.minWidth)
  if (styleProps.minHeight !== undefined) styleObject.minHeight = toCSSUnit(styleProps.minHeight)
  if (styleProps.maxWidth !== undefined) styleObject.maxWidth = toCSSUnit(styleProps.maxWidth)
  if (styleProps.maxHeight !== undefined) styleObject.maxHeight = toCSSUnit(styleProps.maxHeight)
  if (styleProps.position) styleObject.position = styleProps.position
  if (styleProps.display) styleObject.display = styleProps.display
  if (styleProps.flexDirection) styleObject.flexDirection = styleProps.flexDirection
  if (styleProps.flexWrap) styleObject.flexWrap = styleProps.flexWrap
  if (styleProps.justifyContent) styleObject.justifyContent = styleProps.justifyContent
  if (styleProps.alignItems) styleObject.alignItems = styleProps.alignItems
  if (styleProps.alignSelf) styleObject.alignSelf = styleProps.alignSelf
  if (styleProps.flex !== undefined) styleObject.flex = styleProps.flex
  if (styleProps.gap) styleObject.gap = theme.spacing[styleProps.gap as keyof typeof theme.spacing]
  if (styleProps.order !== undefined) styleObject.order = styleProps.order
  if (styleProps.gridTemplateColumns) styleObject.gridTemplateColumns = styleProps.gridTemplateColumns
  if (styleProps.gridTemplateRows) styleObject.gridTemplateRows = styleProps.gridTemplateRows
  if (styleProps.gridColumn) styleObject.gridColumn = styleProps.gridColumn
  if (styleProps.gridRow) styleObject.gridRow = styleProps.gridRow
  if (styleProps.cursor) styleObject.cursor = styleProps.cursor
  if (styleProps.overflow) styleObject.overflow = styleProps.overflow
  if (styleProps.transition) Object.assign(styleObject, styles.transition(styleProps.transition))
  if (styleProps.transform) styleObject.transform = styleProps.transform
  if (styleProps.opacity !== undefined) styleObject.opacity = styleProps.opacity

  return styleObject as CSSProperties
}

export const Box = forwardRef(({
  as: Component = 'div',
  children,
  className,
  style = {},
  padding,
  margin,
  borderRadius,
  shadow,
  backgroundColor,
  color,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  position,
  display,
  flexDirection,
  flexWrap,
  justifyContent,
  alignItems,
  alignSelf,
  flex,
  gap,
  order,
  gridTemplateColumns,
  gridTemplateRows,
  gridColumn,
  gridRow,
  cursor,
  overflow,
  transition,
  transform,
  opacity,
  version = '1.0.0',
  ...rest
}, ref) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const styleProps: StyleProps = {
    padding,
    margin,
    borderRadius,
    shadow,
    backgroundColor,
    color,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    position,
    display,
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    alignSelf,
    flex,
    gap,
    order,
    gridTemplateColumns,
    gridTemplateRows,
    gridColumn,
    gridRow,
    cursor,
    overflow,
    transition,
    transform,
    opacity,
  }

  const computedStyles = {
    ...createStyleObject(styleProps, theme, styles),
    ...style,
  }

  const elementProps = {
    ref,
    className: cn('box', className),
    style: computedStyles,
    'data-version': version,
  }

  return React.createElement(Component, { ...elementProps, ...rest }, children)
}) as BoxComponent

Box.displayName = 'Box'
