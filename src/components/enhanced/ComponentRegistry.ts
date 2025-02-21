import { ComponentImplementation, ComponentInstance, ComponentStyle, ComponentSchema, ComponentCategory } from './types';

class ComponentRegistry {
  private components: Map<string, ComponentImplementation>;
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

  public registerComponent(component: ComponentImplementation): void {
    if (this.components.has(component.id)) {
      throw new Error(`Component with id ${component.id} is already registered`);
    }
    this.components.set(component.id, component);
  }

  public getComponent(id: string): ComponentImplementation | undefined {
    return this.components.get(id);
  }

  public getAllComponents(): ComponentImplementation[] {
    return Array.from(this.components.values());
  }

  public getComponentsByCategory(category: ComponentCategory): ComponentImplementation[] {
    return this.getAllComponents().filter(component => component.category === category);
  }

  public createComponentInstance(
    componentId: string,
    props: Record<string, any>,
    variant?: string,
    customStyle?: ComponentStyle
  ): ComponentInstance {
    const component = this.getComponent(componentId);
    if (!component) {
      throw new Error(`Component with id ${componentId} not found`);
    }

    // Validate props against schema
    this.validateProps(component, props);

    // Merge styles
    const style = {
      ...component.defaultProps.style,
      ...(variant && component.variants?.[variant]?.style),
      ...customStyle,
    };

    // Merge props
    const mergedProps = {
      ...component.defaultProps,
      ...(variant && component.variants?.[variant]?.props),
      ...props,
      style,
    };

    return {
      componentId,
      props: mergedProps,
      variant,
      customStyle,
    };
  }

  private validateProps(
    component: ComponentImplementation,
    props: Record<string, any>
  ): void {
    // Check required fields
    Object.entries(component.schema).forEach(([key, field]) => {
      if (field.required && props[key] === undefined) {
        throw new Error(`Required prop '${key}' is missing for component ${component.id}`);
      }
    });

    // Validate prop types (basic validation)
    Object.entries(props).forEach(([key, value]) => {
      const fieldSchema = component.schema[key];
      if (!fieldSchema) {
        // Skip validation for internal props like 'style'
        if (!['style', 'className', 'id'].includes(key)) {
          throw new Error(`Unknown prop '${key}' for component ${component.id}`);
        }
        return;
      }

      // Basic type checking
      switch (fieldSchema.type) {
        case 'text':
        case 'textarea':
          if (value !== undefined && typeof value !== 'string') {
            throw new Error(`Prop '${key}' must be a string`);
          }
          break;
        case 'number':
          if (value !== undefined && typeof value !== 'number') {
            throw new Error(`Prop '${key}' must be a number`);
          }
          break;
        case 'checkbox':
          if (value !== undefined && typeof value !== 'boolean') {
            throw new Error(`Prop '${key}' must be a boolean`);
          }
          break;
        case 'select':
          if (value !== undefined && fieldSchema.options && !fieldSchema.options.find(opt => opt.value === value)) {
            throw new Error(`Invalid value for select prop '${key}'`);
          }
          break;
        case 'relationship':
          if (fieldSchema.hasMany && value !== undefined && !Array.isArray(value)) {
            throw new Error(`Prop '${key}' must be an array for hasMany relationship`);
          }
          break;
      }
    });
  }

  public renderComponent(instance: ComponentInstance): React.ReactElement | null {
    const component = this.getComponent(instance.componentId);
    if (!component) {
      console.error(`Component with id ${instance.componentId} not found`);
      return null;
    }

    try {
      return component.render({
        props: instance.props,
        variant: instance.variant,
        customStyle: instance.customStyle,
      });
    } catch (error) {
      console.error(`Error rendering component ${instance.componentId}:`, error);
      return null;
    }
  }

  public getComponentSchema(componentId: string): ComponentSchema {
    const component = this.getComponent(componentId);
    if (!component) {
      throw new Error(`Component with id ${componentId} not found`);
    }
    return component.schema;
  }

  public getComponentVariants(componentId: string) {
    const component = this.getComponent(componentId);
    if (!component) {
      throw new Error(`Component with id ${componentId} not found`);
    }
    return component.variants || {};
  }
}

export const componentRegistry = ComponentRegistry.getInstance();
