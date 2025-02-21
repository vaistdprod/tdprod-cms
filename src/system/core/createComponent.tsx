import React from 'react';
import { ComponentImplementation, ComponentProps } from './types';
import { componentRegistry } from './ComponentRegistry';

export function createComponent<P extends ComponentProps>(
  implementation: ComponentImplementation<P>
): React.FC<P> {
  // Register the component
  componentRegistry.registerComponent(implementation);

  // Create and return the React component
  const Component: React.FC<P> = (props) => {
    const instance = componentRegistry.createComponentInstance<P>(
      implementation.id,
      props
    );
    return implementation.render(instance.props as P);
  };

  // Set display name for better debugging
  Component.displayName = implementation.id;

  return Component;
}

// Helper type for components created with createComponent
export type CreatedComponent<P extends ComponentProps> = React.FC<P>;
