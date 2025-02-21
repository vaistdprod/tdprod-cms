# Multi-Tenant CMS for Website Creation

A flexible, multi-tenant CMS system designed for creating and managing client websites across various industries. Built with Next.js, Payload CMS, and TypeScript.

## Features

- 🏢 **Multi-tenant Architecture**: Host multiple client websites under a single deployment
- 🎨 **Dynamic Templates**: Industry-specific templates with customizable components
- 🔧 **Component System**: Reusable, extensible component library with built-in validation
- 🎯 **Industry Focus**: Specialized templates for different sectors (medical, legal, etc.)
- 🎭 **Theme Support**: Customizable themes with design tokens and style inheritance
- 📱 **Responsive Design**: Mobile-first approach with adaptive layouts
- 🔍 **SEO Optimized**: Built-in SEO tools and structured data generation
- 🌐 **Multi-language**: Support for multiple languages and localization
- 🚀 **Easy Deployment**: Streamlined deployment to various platforms

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tdprod-cms.git
   cd tdprod-cms
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a new site using the CLI:
   ```bash
   pnpm create-site
   ```

## Creating a New Site

### Using the CLI

The easiest way to create a new site is using our interactive CLI:

```bash
pnpm create-site
```

Follow the prompts to:
- Choose a template (e.g., medical, legal)
- Enter basic information
- Select desired features
- Configure deployment options

### Programmatically

You can also create sites programmatically:

```typescript
import { createMedicalSite } from './scripts/create-medical-site';
import { MedicalSiteConfig } from './templates/medical';

const config: MedicalSiteConfig = {
  practiceName: "Example Medical Practice",
  // ... other configuration options
};

const options = {
  seo: {
    titleSuffix: " | Best Care in Town",
  },
  features: {
    darkMode: true,
    multilingual: {
      enabled: true,
      locales: ['en', 'es'],
    },
  },
};

const site = await createMedicalSite(config, options);
```

## Template System

### Available Templates

- **Medical Practice Template**
  - Appointment scheduling
  - Patient portal integration
  - HIPAA compliance features
  - Medical team profiles
  - Service listings

### Creating Custom Templates

1. Define the template configuration:
```typescript
interface CustomTemplateConfig {
  // Define your configuration schema
}
```

2. Create template components:
```typescript
const CustomComponent: ComponentImplementation<CustomProps> = {
  // Implement your component
};
```

3. Register the template:
```typescript
const customTemplate = createTemplate<CustomSite>({
  // Define your template
});
```

## Component System

### Core Components

- **Layout**
  - Box: Basic container with style props
  - Stack: Flex container for vertical/horizontal layouts
  - Grid: CSS Grid container with responsive support

### Creating Custom Components

```typescript
const MyComponent: ComponentImplementation<MyProps> = {
  id: 'MyComponent',
  category: 'content',
  schema: {
    // Define prop types and validation
  },
  defaultProps: {
    // Set default values
  },
  variants: {
    // Define component variants
  },
  render: (props) => {
    // Implement the component
  },
};
```

## Theme System

### Base Theme

The base theme provides default design tokens:
- Colors
- Typography
- Spacing
- Breakpoints
- Shadows
- Transitions

### Extending Themes

```typescript
const customTheme = {
  ...baseTheme,
  colors: {
    primary: {
      // Custom color palette
    },
  },
  // Other customizations
};
```

## Development

### Directory Structure

```
src/
  ├── system/           # Core system components
  │   ├── core/        # Core functionality
  │   ├── components/  # Base components
  │   └── styles/      # Theme system
  ├── templates/       # Industry templates
  │   ├── medical/     # Medical template
  │   └── legal/       # Legal template
  ├── scripts/         # CLI and utilities
  └── app/            # Next.js application
```

### Running Locally

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Build for production:
   ```bash
   pnpm build
   ```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details
