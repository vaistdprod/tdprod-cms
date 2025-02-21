import { CSSProperties, ReactElement } from 'react';

// Since we can't import from payload/types directly, we'll define our basic field types
type BaseField = {
  name?: string;
  label?: string;
  required?: boolean;
  unique?: boolean;
  index?: boolean;
  defaultValue?: any;
  admin?: Record<string, any>;
};

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'relationship'
  | 'date'
  | 'email'
  | 'group'
  | 'array'
  | 'upload'
  | 'blocks'
  | 'richText';

export type Field = BaseField & {
  type: FieldType;
  options?: { label: string; value: string }[];
  fields?: Field[];
  relationTo?: string;
  hasMany?: boolean;
};

export type ComponentCategory = 'core' | 'industry' | 'custom';

export interface ComponentStyle extends CSSProperties {
  [key: string]: string | number | ComponentStyle | undefined;
}

export interface ComponentVariant {
  name: string;
  style: ComponentStyle;
}

export interface ComponentField extends Omit<Field, 'type'> {
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  fields?: ComponentField[];
  relationTo?: string;
  hasMany?: boolean;
  defaultValue?: any;
}

export interface ComponentSchema {
  [key: string]: ComponentField;
}

export interface ComponentConfig {
  id: string;
  name: string;
  category: ComponentCategory;
  version: string;
  description?: string;
  schema: ComponentSchema;
  defaultProps: {
    style?: ComponentStyle;
    [key: string]: any;
  };
  variants?: Record<string, {
    style?: ComponentStyle;
    props?: Record<string, any>;
  }>;
}

export interface ComponentProps {
  props: Record<string, any>;
  variant?: string;
  customStyle?: ComponentStyle;
}

export interface ComponentInstance {
  componentId: string;
  props: Record<string, any>;
  variant?: string;
  customStyle?: ComponentStyle;
}

export interface ComponentImplementation extends ComponentConfig {
  render: (props: ComponentProps) => ReactElement;
}

export type ComponentLoader = Promise<{ default: ComponentImplementation }>;

export interface ComponentRegistry {
  registerComponent: (component: ComponentImplementation) => void;
  getComponent: (id: string) => ComponentImplementation | undefined;
  getAllComponents: () => ComponentImplementation[];
  getComponentsByCategory: (category: ComponentCategory) => ComponentImplementation[];
  createComponentInstance: (
    componentId: string,
    props: Record<string, any>,
    variant?: string,
    customStyle?: ComponentStyle
  ) => ComponentInstance;
  renderComponent: (instance: ComponentInstance) => ReactElement | null;
  getComponentSchema: (componentId: string) => ComponentSchema;
  getComponentVariants: (componentId: string) => Record<string, {
    style?: ComponentStyle;
    props?: Record<string, any>;
  }>;
}
