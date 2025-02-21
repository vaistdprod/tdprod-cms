import React, { createContext, useContext, useMemo } from 'react'
import { ThemeConfig } from './types'

// Default theme configuration
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745',
    background: '#ffffff',
    text: '#212529',
    error: '#dc3545',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}

// Create theme context
const ThemeContext = createContext<ThemeConfig>(defaultTheme)

export interface ThemeProviderProps {
  theme?: Partial<ThemeConfig>
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = {},
  children,
}) => {
  // Merge default theme with provided theme
  const mergedTheme = useMemo(() => {
    return mergeTheme(defaultTheme, theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to access theme
export const useTheme = () => {
  const theme = useContext(ThemeContext)
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return theme
}

// Helper function to merge themes
function mergeTheme(base: ThemeConfig, override: Partial<ThemeConfig>): ThemeConfig {
  const result = { ...base }

  // Helper function for deep merging
  const deepMerge = (target: any, source: any) => {
    Object.keys(source).forEach(key => {
      if (source[key] instanceof Object && key in target) {
        deepMerge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    })
  }

  deepMerge(result, override)
  return result
}

// CSS-in-JS helper functions
export const createStyles = (theme: ThemeConfig) => ({
  // Typography helpers
  text: (size: keyof ThemeConfig['typography']['fontSize'] = 'base') => ({
    fontSize: theme.typography.fontSize[size],
  }),

  // Color helpers
  color: (color: keyof ThemeConfig['colors']) => ({
    color: theme.colors[color],
  }),

  bg: (color: keyof ThemeConfig['colors']) => ({
    backgroundColor: theme.colors[color],
  }),

  // Spacing helpers
  spacing: (size: keyof ThemeConfig['spacing']) => ({
    padding: theme.spacing[size],
  }),

  margin: (size: keyof ThemeConfig['spacing']) => ({
    margin: theme.spacing[size],
  }),

  // Border radius helpers
  rounded: (size: keyof ThemeConfig['borderRadius'] = 'md') => ({
    borderRadius: theme.borderRadius[size],
  }),

  // Shadow helpers
  shadow: (size: keyof ThemeConfig['shadows'] = 'md') => ({
    boxShadow: theme.shadows[size],
  }),

  // Transition helpers
  transition: (speed: keyof ThemeConfig['transitions'] = 'normal') => ({
    transition: theme.transitions[speed],
  }),

  // Responsive helpers
  mediaQuery: (breakpoint: keyof ThemeConfig['breakpoints']) => `@media (min-width: ${theme.breakpoints[breakpoint]})`,
})
