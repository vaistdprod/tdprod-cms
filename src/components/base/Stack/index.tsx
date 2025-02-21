import React, { forwardRef } from 'react'
import { Box, BoxBaseProps, DisplayValue, FlexDirectionValue } from '../Box'
import { createStyles } from '../ThemeProvider'

type SpacingKeys = keyof ReturnType<typeof createStyles>['spacing']

type StackBaseProps = Omit<BoxBaseProps, 'display' | 'gap' | 'flexDirection'> & {
  direction?: 'row' | 'column'
  spacing?: SpacingKeys
  align?: BoxBaseProps['alignItems']
  justify?: BoxBaseProps['justifyContent']
  wrap?: BoxBaseProps['flexWrap']
  inline?: boolean
  divider?: React.ReactNode
}

export interface StackProps extends StackBaseProps {}

type BoxProps = {
  ref: React.Ref<HTMLDivElement>
  display: DisplayValue
  flexDirection: FlexDirectionValue
  gap?: SpacingKeys
  alignItems?: BoxBaseProps['alignItems']
  justifyContent?: BoxBaseProps['justifyContent']
  flexWrap?: BoxBaseProps['flexWrap']
  children: React.ReactNode
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(({
  children,
  direction = 'column',
  spacing = 'md',
  align,
  justify,
  wrap,
  inline = false,
  divider,
  ...rest
}, ref) => {
  const items = React.Children.toArray(children).filter(Boolean)

  if (items.length === 0) {
    return null
  }

  const stackItems = items.map((item, index) => {
    if (index === items.length - 1) {
      return <React.Fragment key={index}>{item}</React.Fragment>
    }

    return (
      <React.Fragment key={index}>
        {item}
        {divider && <div className="stack-divider">{divider}</div>}
      </React.Fragment>
    )
  })

  const boxDisplay: DisplayValue = inline ? 'inline-flex' : 'flex'
  const boxDirection: FlexDirectionValue = direction

  const boxProps: Partial<BoxProps> = {
    ref,
    display: boxDisplay,
    flexDirection: boxDirection,
    gap: spacing,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap,
  }

  return (
    <Box
      {...boxProps}
      {...rest}
    >
      {stackItems}
    </Box>
  )
})

Stack.displayName = 'Stack'

// Convenience components for common stack patterns
export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="column" {...props} />
))

VStack.displayName = 'VStack'

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="row" {...props} />
))

HStack.displayName = 'HStack'
