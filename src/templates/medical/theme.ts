import { ThemeTokens } from '../../system';
import { baseTheme } from '../../system';

export const medicalTheme: ThemeTokens = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: {
      '50': '#ebf8ff',
      '100': '#bee3f8',
      '200': '#90cdf4',
      '300': '#63b3ed',
      '400': '#4299e1',
      '500': '#3182ce',  // Primary brand color
      '600': '#2b6cb0',
      '700': '#2c5282',
      '800': '#2a4365',
      '900': '#1A365D',
    },
    accent: {
      '50': '#F0FFF4',
      '100': '#C6F6D5',
      '200': '#9AE6B4',
      '300': '#68D391',
      '400': '#48BB78',
      '500': '#38A169',  // Success/positive actions
      '600': '#2F855A',
      '700': '#276749',
      '800': '#22543D',
      '900': '#1C4532',
    },
    neutral: {
      '50': '#F7FAFC',
      '100': '#EDF2F7',
      '200': '#E2E8F0',
      '300': '#CBD5E0',
      '400': '#A0AEC0',
      '500': '#718096',
      '600': '#4A5568',
      '700': '#2D3748',
      '800': '#1A202C',
      '900': '#171923',
    },
    emergency: {
      '50': '#FFF5F5',
      '100': '#FED7D7',
      '200': '#FEB2B2',
      '300': '#FC8181',
      '400': '#F56565',
      '500': '#E53E3E',  // Emergency/critical
      '600': '#C53030',
      '700': '#9B2C2C',
      '800': '#822727',
      '900': '#63171B',
    },
  },
  typography: {
    ...baseTheme.typography,
    fonts: {
      ...baseTheme.typography.fonts,
      sans: '"Source Sans Pro", system-ui, -apple-system, sans-serif',
      serif: '"Merriweather", Georgia, serif',
      mono: '"Fira Code", monospace',
    },
  },
  // Healthcare-specific shadows
  shadows: {
    ...baseTheme.shadows,
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    'card-active': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  // Healthcare-specific border radii
  radii: {
    ...baseTheme.radii,
    card: '0.75rem',
    button: '0.5rem',
    input: '0.375rem',
    badge: '9999px',
  },
  // Healthcare-specific transitions
  transitions: {
    ...baseTheme.transitions,
    card: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    button: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    modal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
