import { ReactNode } from 'react';

// Basic style types
export type StyleValue = string | number;
export type StyleObject = Record<string, StyleValue>;

// Component types
export interface ComponentStyle {
  base?: StyleObject;
  variants?: Record<string, StyleObject>;
  states?: Record<string, StyleObject>;
}

export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export interface ComponentImplementation<P extends ComponentProps = ComponentProps> {
  id: string;
  category: ComponentCategory;
  schema: ComponentSchema;
  defaultProps: Partial<P>;
  render: (props: P) => ReactNode;
  variants?: Record<string, {
    props?: Partial<P>;
    style?: ComponentStyle;
  }>;
}

// Schema types for component props validation
export type SchemaType = 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'array' 
  | 'object'
  | 'relationship'
  | 'media'
  | 'richText';

export interface SchemaField {
  type: SchemaType;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  fields?: Record<string, SchemaField>; // For object and array types
  relationTo?: string; // For relationship type
  hasMany?: boolean; // For relationship type
  min?: number;
  max?: number;
  validate?: (value: any) => boolean | string;
}

export type ComponentSchema = Record<string, SchemaField>;

// Component categories for organization
export type ComponentCategory = 
  | 'layout'    // Layout components like Grid, Stack, Container
  | 'content'   // Content components like Text, Heading, Image
  | 'input'     // Input components like Button, TextField, Select
  | 'display'   // Display components like Card, Alert, Badge
  | 'navigation' // Navigation components like Menu, Breadcrumb
  | 'feedback'   // Feedback components like Modal, Toast
  | 'data'      // Data components like Table, List
  | 'specialty'; // Industry-specific components

// Template types
export interface TemplateConfig {
  id: string;
  name: string;
  description?: string;
  components: Record<string, ComponentImplementation>;
  layouts: Record<string, ComponentImplementation>;
  styles: {
    tokens: Record<string, any>;
    components: Record<string, ComponentStyle>;
    utilities: Record<string, Record<string, string>>;
  };
}

// Override types for template customization
export type ComponentOverride<P extends ComponentProps = ComponentProps> = Partial<
  Omit<ComponentImplementation<P>, 'id' | 'category'>
>;

export interface TemplateOverrides {
  components?: Record<string, ComponentOverride>;
  layouts?: Record<string, ComponentOverride>;
  styles?: Partial<TemplateConfig['styles']>;
}

// Instance types for rendered components
export interface ComponentInstance {
  componentId: string;
  props: Record<string, any>;
  variant?: string;
  customStyle?: ComponentStyle;
}

// Page types
export interface PageConfig {
  title: string;
  slug: string;
  layout: ComponentInstance[];
  meta?: {
    description?: string;
    keywords?: string[];
    [key: string]: any;
  };
}

// Site configuration
export interface SiteConfig {
  template: string;
  overrides?: TemplateOverrides;
  pages: Record<string, PageConfig>;
  theme?: {
    colors?: Record<string, string>;
    typography?: {
      fonts?: Record<string, string>;
      sizes?: Record<string, [string, string]>;
    };
    spacing?: Record<string, string>;
    [key: string]: any;
  };
}
