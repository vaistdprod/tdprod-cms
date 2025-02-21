// Medical template exports
export * from './medical';

// Template utilities
export interface BaseTemplateConfig {
  theme: Record<string, any>;
  config: Record<string, any>;
  pages: Record<string, {
    path: string;
    sections: Array<{
      type: string;
      props: Record<string, any>;
    }>;
  }>;
}

export interface TemplateOptions {
  // Common options that apply to all templates
  seo?: {
    titleSuffix?: string;
    defaultMetaTags?: Record<string, string>;
  };
  analytics?: {
    provider: 'google' | 'plausible' | 'fathom';
    id: string;
  };
  features?: {
    darkMode?: boolean;
    multilingual?: {
      enabled: boolean;
      defaultLocale?: string;
      locales?: string[];
    };
    search?: {
      enabled: boolean;
      provider?: 'algolia' | 'meilisearch';
      config?: Record<string, any>;
    };
  };
  deployment?: {
    platform?: 'vercel' | 'netlify' | 'aws';
    config?: Record<string, any>;
  };
}

export interface TemplateImplementation<T extends BaseTemplateConfig> {
  // Template metadata
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'business' | 'healthcare' | 'education' | 'ecommerce' | 'portfolio';
  
  // Template creation function
  create: (config: T['config'], options?: TemplateOptions) => T;
  
  // Template validation
  validate?: (config: T['config']) => boolean | { valid: boolean; errors: string[] };
  
  // Template customization
  extend?: (base: T, overrides: Partial<T>) => T;
  
  // Template utilities
  utils?: {
    [key: string]: (...args: any[]) => any;
  };
}

// Helper function to create a new template implementation
export function createTemplate<T extends BaseTemplateConfig>(
  implementation: TemplateImplementation<T>
): TemplateImplementation<T> {
  return implementation;
}
