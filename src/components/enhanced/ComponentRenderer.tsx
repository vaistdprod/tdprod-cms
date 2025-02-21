import React, { useEffect, useState } from 'react';
import { ComponentInstance, ComponentImplementation, ComponentStyle } from './types';
import { componentRegistry } from './ComponentRegistry';
import { componentLoader } from './ComponentLoader';

interface ComponentRendererProps {
  instance: ComponentInstance;
  onError?: (error: Error) => void;
}

interface BlockRendererProps {
  blocks: ComponentInstance[];
  template?: string;
  onError?: (error: Error) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  instance,
  onError,
}) => {
  try {
    const component = componentRegistry.getComponent(instance.componentId);
    if (!component) {
      throw new Error(`Component ${instance.componentId} not found`);
    }

    return componentRegistry.renderComponent(instance) || null;
  } catch (error) {
    if (error instanceof Error) {
      onError?.(error);
      console.error(`Error rendering component ${instance.componentId}:`, error);
    }
    return null;
  }
};

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  blocks,
  template,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        if (template) {
          await componentLoader.loadComponentsForTemplate(template);
        }
        setIsLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load components');
        setError(error);
        onError?.(error);
        setIsLoading(false);
      }
    };

    loadComponents();
  }, [template]);

  if (isLoading) {
    return <div>Loading components...</div>;
  }

  if (error) {
    return <div>Error loading components: {error.message}</div>;
  }

  return (
    <>
      {blocks.map((block, index) => (
        <ComponentRenderer
          key={`${block.componentId}-${index}`}
          instance={block}
          onError={onError}
        />
      ))}
    </>
  );
};

interface ComponentPreviewProps {
  component: ComponentImplementation;
  props?: Record<string, any>;
  variant?: string;
  customStyle?: ComponentStyle;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component,
  props = {},
  variant,
  customStyle,
}) => {
  try {
    const instance = componentRegistry.createComponentInstance(
      component.id,
      props,
      variant,
      customStyle
    );

    return <ComponentRenderer instance={instance} />;
  } catch (error) {
    console.error('Error rendering component preview:', error);
    return <div>Error rendering component preview</div>;
  }
};

// Example usage:
/*
const pageBlocks = [
  {
    componentId: 'hero',
    props: {
      heading: 'Welcome to Our Clinic',
      subheading: 'Expert Healthcare Services',
      backgroundImage: '/images/hero.jpg',
      ctaButton: {
        label: 'Book Appointment',
        link: '/appointments',
        style: 'primary',
      },
    },
    variant: 'fullscreen',
  },
  {
    componentId: 'appointment-scheduler',
    props: {
      title: 'Schedule Your Visit',
      description: 'Choose a convenient time for your appointment',
      showInsuranceField: true,
    },
  },
];

// In your page component:
<BlockRenderer
  blocks={pageBlocks}
  template="healthcare"
  onError={(error) => console.error('Rendering error:', error)}
/>

// For component preview in admin:
<ComponentPreview
  component={heroComponent}
  props={{
    heading: 'Preview Title',
    subheading: 'Preview Subtitle',
  }}
  variant="minimal"
/>
*/
