import { componentRegistry } from './ComponentRegistry';
import { ComponentImplementation, ComponentLoader as ComponentLoaderType, ComponentCategory } from './types';

class ComponentLoader {
  private static instance: ComponentLoader;
  private loadedComponents: Set<string>;

  private constructor() {
    this.loadedComponents = new Set();
  }

  public static getInstance(): ComponentLoader {
    if (!ComponentLoader.instance) {
      ComponentLoader.instance = new ComponentLoader();
    }
    return ComponentLoader.instance;
  }

  public async loadComponentsForTemplate(template: string): Promise<void> {
    if (this.loadedComponents.has(template)) {
      return;
    }

    try {
      switch (template) {
        case 'healthcare':
          await this.loadHealthcareComponents();
          break;
        case 'legal':
          await this.loadLegalComponents();
          break;
        // Add more template types as needed
        default:
          await this.loadBaseComponents();
      }

      this.loadedComponents.add(template);
    } catch (error) {
      console.error(`Error loading components for template ${template}:`, error);
      throw error;
    }
  }

  private async loadBaseComponents(): Promise<void> {
    // Load core components that are available to all templates
    const coreComponents: ComponentLoaderType[] = [
      import('./core/Hero'),
      // Add more core component imports
    ];

    const loadedComponents = await Promise.all(coreComponents);
    loadedComponents.forEach(component => {
      this.registerComponent(component.default);
    });
  }

  private async loadHealthcareComponents(): Promise<void> {
    // First load base components
    await this.loadBaseComponents();

    // Then load healthcare-specific components
    const healthcareComponents: ComponentLoaderType[] = [
      import('./healthcare/AppointmentScheduler'),
      // Add more healthcare component imports
    ];

    const loadedComponents = await Promise.all(healthcareComponents);
    loadedComponents.forEach(component => {
      this.registerComponent(component.default);
    });
  }

  private async loadLegalComponents(): Promise<void> {
    // First load base components
    await this.loadBaseComponents();

    // Then load legal-specific components
    const legalComponents: ComponentLoaderType[] = [
      // Add legal component imports
    ];

    const loadedComponents = await Promise.all(legalComponents);
    loadedComponents.forEach(component => {
      this.registerComponent(component.default);
    });
  }

  public registerComponent(component: ComponentImplementation): void {
    componentRegistry.registerComponent(component);
  }

  public getRegisteredComponents(): ComponentImplementation[] {
    return componentRegistry.getAllComponents();
  }

  public getComponentsByCategory(category: ComponentCategory): ComponentImplementation[] {
    return componentRegistry.getComponentsByCategory(category);
  }

  public clearLoadedComponents(): void {
    this.loadedComponents.clear();
  }
}

export const componentLoader = ComponentLoader.getInstance();
