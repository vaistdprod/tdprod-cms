// Core exports
export { componentRegistry } from './core/ComponentRegistry';
export { styleRegistry } from './styles/StyleRegistry';
export { createComponent } from './core/createComponent';
export { baseTheme } from './styles/baseTheme';

// Layout components
export * from './components/layout';

// Types
export type {
  // Core types
  ComponentProps,
  ComponentImplementation,
  ComponentInstance,
  ComponentStyle,
  ComponentSchema,
  ComponentCategory,
  SchemaType,
  SchemaField,
  StyleObject,
} from './core/types';

export type {
  // Style types
  ThemeTokens,
  StyleDefinition,
  ThemeOverrides,
} from './styles/StyleRegistry';

// Helper type for created components
export type { CreatedComponent } from './core/createComponent';
