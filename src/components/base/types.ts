import { ReactNode } from 'react'

// Base component props that all components should extend
export interface BaseComponentProps {
  className?: string
  id?: string
  style?: React.CSSProperties
  'data-testid'?: string
}

// Props for components that can contain children
export interface ContainerProps extends BaseComponentProps {
  children?: ReactNode
}

// Props for components that can be disabled
export interface DisableableProps extends BaseComponentProps {
  disabled?: boolean
}

// Props for components that can be focused
export interface FocusableProps extends DisableableProps {
  tabIndex?: number
  onFocus?: (event: React.FocusEvent) => void
  onBlur?: (event: React.FocusEvent) => void
}

// Props for interactive components
export interface InteractiveProps extends FocusableProps {
  onClick?: (event: React.MouseEvent) => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  onKeyUp?: (event: React.KeyboardEvent) => void
  onMouseEnter?: (event: React.MouseEvent) => void
  onMouseLeave?: (event: React.MouseEvent) => void
}

// Props for form input components
export interface InputProps extends InteractiveProps {
  name?: string
  value?: string | number | readonly string[]
  defaultValue?: string | number | readonly string[]
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  autoComplete?: string
  autoFocus?: boolean
  form?: string
  max?: number | string
  maxLength?: number
  min?: number | string
  minLength?: number
  pattern?: string
  type?: string
}

// Props for components that can be validated
export interface ValidatableProps extends BaseComponentProps {
  error?: string | string[]
  valid?: boolean
  validationMessage?: string
}

// Theme configuration
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    error: string
    success: string
    warning: string
    info: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    fontWeight: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      none: number
      tight: number
      snug: number
      normal: number
      relaxed: number
      loose: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  transitions: {
    fast: string
    normal: string
    slow: string
  }
  breakpoints: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
}

// Component variant configuration
export interface VariantConfig {
  name: string
  className: string
  props?: Record<string, any>
}

// Component size configuration
export interface SizeConfig {
  name: string
  className: string
  props?: Record<string, any>
}

// Base component configuration
export interface ComponentConfig {
  name: string
  version: string
  variants?: VariantConfig[]
  sizes?: SizeConfig[]
  defaultProps?: Record<string, any>
  themeOverrides?: Partial<ThemeConfig>
}
