import { 
  ComponentImplementation, 
  ComponentInstance, 
  ComponentProps, 
  ComponentStyle, 
  ComponentSchema,
  ComponentCategory,
  StyleObject
} from './types';

class ComponentRegistry {
  private components: Map<string, ComponentImplementation<any>>;
  private static instance: ComponentRegistry;

  private constructor() {
    this.components = new Map();
  }

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  public registerComponent<P extends ComponentProps>(component: ComponentImplementation<P>): void {
    if (this.components.has(component.id)) {
      throw new Error(`Component with id ${component.id} is already registered`);
    }
    this.components.set(component.id, component);
  }

  public extendComponent<P extends ComponentProps>(
    baseId: string,
    extension: Partial<Omit<ComponentImplementation<P>, 'id' | 'category'>>
  ): ComponentImplementation<P> {
    const baseComponent = this.getComponent<P>(baseId);
    if (!baseComponent) {
      throw new Error(`Base component with id ${baseId} not found`);
    }

    // Create new component ID
    const newId = `${baseId}-extended-${Date.now()}`;

    // Merge schemas
    const schema: ComponentSchema = {
      ...baseComponent.schema,
      ...extension.schema,
    };

    // Merge variants with type safety
    const variants: Record<string, {
      props?: Partial<P>;
      style?: ComponentStyle;
    }> = {};

    // Merge base variants
    if (baseComponent.variants) {
      Object.entries(baseComponent.variants).forEach(([key, value]) => {
        variants[key] = value as { props?: Partial<P>; style?: ComponentStyle };
      });
    }

    // Merge extension variants
    if (extension.variants) {
      Object.entries(extension.variants).forEach(([key, value]) => {
        variants[key] = {
          ...variants[key],
          ...value,
        };
      });
    }

    // Merge default props with type safety
    const defaultProps = {
      ...baseComponent.defaultProps,
      ...extension.defaultProps,
    } as Partial<P>;

    // Create extended component
    const extendedComponent: ComponentImplementation<P> = {
      id: newId,
      category: baseComponent.category,
      schema,
      defaultProps,
      variants,
      render: extension.render || baseComponent.render,
    };

    this.registerComponent<P>(extendedComponent);
    return extendedComponent;
  }

  public createComponentInstance<P extends ComponentProps>(
    componentId: string,
    props: Partial<P>,
    variant?: string,
    customStyle?: ComponentStyle
  ): ComponentInstance {
    const component = this.getComponent<P>(componentId);
    if (!component) {
      throw new Error(`Component with id ${componentId} not found`);
    }

    // Validate props against schema
    this.validateProps<P>(component, props);

    // Merge styles
    const style = this.mergeStyles(
      component.defaultProps.style as StyleObject,
      variant ? (component.variants?.[variant]?.style?.base as StyleObject) : undefined,
      customStyle?.base as StyleObject
    );

    // Merge props with type safety
    const mergedProps = {
      ...component.defaultProps,
      ...(variant && component.variants?.[variant]?.props),
      ...props,
      style,
    } as unknown as P;  // Safe cast since we've validated the props

    return {
      componentId,
      props: mergedProps,
      variant,
      customStyle,
    };
  }

  private mergeStyles(...styles: (StyleObject | undefined)[]): StyleObject {
    const result: StyleObject = {};
    
    for (const style of styles) {
      if (style) {
        Object.assign(result, style);
      }
    }
    
    return result;
  }

  private validateProps<P extends ComponentProps>(
    component: ComponentImplementation<P>,
    props: Partial<P>
  ): void {
    // Check required fields
    Object.entries(component.schema).forEach(([key, field]) => {
      if (field.required && props[key] === undefined) {
        throw new Error(`Required prop '${key}' is missing for component ${component.id}`);
      }
    });

    // Validate prop types and values
    Object.entries(props).forEach(([key, value]) => {
      const fieldSchema = component.schema[key];
      if (!fieldSchema) {
        // Skip validation for internal props
        if (!['style', 'className', 'id'].includes(key)) {
          throw new Error(`Unknown prop '${key}' for component ${component.id}`);
        }
        return;
      }

      // Type validation
      this.validateValue(value, fieldSchema, key, component.id);
    });
  }

  private validateValue(
    value: any, 
    schema: ComponentSchema[string], 
    key: string, 
    componentId: string
  ): void {
    if (value === undefined) return;

    switch (schema.type) {
      case 'text':
      case 'richText':
        if (typeof value !== 'string') {
          throw new Error(`Prop '${key}' must be a string in component ${componentId}`);
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          throw new Error(`Prop '${key}' must be a number in component ${componentId}`);
        }
        if (schema.min !== undefined && value < schema.min) {
          throw new Error(`Prop '${key}' must be >= ${schema.min} in component ${componentId}`);
        }
        if (schema.max !== undefined && value > schema.max) {
          throw new Error(`Prop '${key}' must be <= ${schema.max} in component ${componentId}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`Prop '${key}' must be a boolean in component ${componentId}`);
        }
        break;

      case 'select':
        if (schema.options && !schema.options.find(opt => opt.value === value)) {
          throw new Error(`Invalid value for select prop '${key}' in component ${componentId}`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Prop '${key}' must be an array in component ${componentId}`);
        }
        if (schema.fields) {
          value.forEach((item, index) => {
            Object.entries(schema.fields || {}).forEach(([fieldKey, fieldSchema]) => {
              this.validateValue(
                item[fieldKey],
                fieldSchema,
                `${key}[${index}].${fieldKey}`,
                componentId
              );
            });
          });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null) {
          throw new Error(`Prop '${key}' must be an object in component ${componentId}`);
        }
        if (schema.fields) {
          Object.entries(schema.fields).forEach(([fieldKey, fieldSchema]) => {
            this.validateValue(value[fieldKey], fieldSchema, `${key}.${fieldKey}`, componentId);
          });
        }
        break;

      case 'relationship':
        if (schema.hasMany && !Array.isArray(value)) {
          throw new Error(`Prop '${key}' must be an array for hasMany relationship in component ${componentId}`);
        }
        break;
    }

    // Custom validation if provided
    if (schema.validate) {
      const result = schema.validate(value);
      if (result !== true) {
        throw new Error(typeof result === 'string' ? result : `Invalid value for prop '${key}' in component ${componentId}`);
      }
    }
  }

  public getComponent<P extends ComponentProps = ComponentProps>(id: string): ComponentImplementation<P> | undefined {
    return this.components.get(id) as ComponentImplementation<P> | undefined;
  }

  public getAllComponents(): ComponentImplementation<any>[] {
    return Array.from(this.components.values());
  }

  public getComponentsByCategory(category: ComponentCategory): ComponentImplementation<any>[] {
    return this.getAllComponents().filter(component => component.category === category);
  }

  public getComponentSchema(componentId: string): ComponentSchema {
    const component = this.getComponent(componentId);
    if (!component) {
      throw new Error(`Component with id ${componentId} not found`);
    }
    return component.schema;
  }
}

export const componentRegistry = ComponentRegistry.getInstance();
