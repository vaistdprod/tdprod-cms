import { CollectionConfig } from 'payload';
import { Theme, Layout } from '../types';
import { ComponentInstance } from '../../components/enhanced/types';

export interface BaseFeatures {
  blog: boolean;
  team: boolean;
  services: boolean;
  testimonials: boolean;
  appointments: boolean;
}

export interface BasePage {
  title: string;
  slug: string;
  layout: ComponentInstance[];
}

export interface BaseCollectionItem {
  [key: string]: any;
}

export interface BaseTemplate {
  name: string;
  slug: string;
  theme: Theme;
  layout: Layout;
  features: BaseFeatures;
  collections: {
    pages: CollectionConfig;
    media: CollectionConfig;
    navigation: CollectionConfig;
    [key: string]: CollectionConfig;
  };
  defaultPages: BasePage[];
  defaultCollections: {
    [key: string]: BaseCollectionItem[];
  };
  components: {
    [key: string]: {
      schema: any;
      defaultProps: any;
      variants?: Record<string, any>;
    };
  };
}

export const baseTemplate: BaseTemplate = {
  name: 'Base Template',
  slug: 'base',
  theme: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      accent: '#28a745',
      background: '#ffffff',
      text: '#212529',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headings: {
        fontFamily: 'Inter, sans-serif',
        weight: 600,
      },
      body: {
        fontFamily: 'Inter, sans-serif',
        weight: 400,
      },
    },
    spacing: {
      unit: 4,
      scale: [0, 4, 8, 16, 24, 32, 48, 64, 96],
    },
    breakpoints: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  layout: {
    header: {
      style: 'standard',
      height: 80,
      sticky: true,
      components: ['Logo', 'Navigation', 'CTAButton'],
    },
    footer: {
      style: 'standard',
      sections: ['primary', 'secondary', 'bottom'],
      components: ['FooterNav', 'SocialLinks', 'Copyright'],
    },
    navigation: {
      style: 'standard',
      depth: 2,
      mobile: 'drawer',
    },
  },
  features: {
    blog: false,
    team: false,
    services: false,
    testimonials: false,
    appointments: false,
  },
  collections: {
    pages: {
      slug: 'pages',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'layout',
          type: 'blocks',
          required: true,
          blocks: [], // Will be populated with registered blocks
        },
        {
          name: 'seo',
          type: 'group',
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'keywords',
              type: 'text',
            },
          ],
        },
      ],
    },
    media: {
      slug: 'media',
      upload: {
        staticDir: 'media',
        adminThumbnail: 'thumbnail',
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'card',
            width: 768,
            height: 1024,
            position: 'centre',
          },
          {
            name: 'hero',
            width: 1920,
            height: 1080,
            position: 'centre',
          },
        ],
      },
      fields: [],
    },
    navigation: {
      slug: 'navigation',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'link',
              type: 'text',
              required: true,
            },
            {
              name: 'children',
              type: 'array',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'link',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  defaultPages: [
    {
      title: 'Home',
      slug: 'home',
      layout: [],
    },
  ],
  defaultCollections: {},
  components: {
    Hero: {
      schema: {
        heading: { type: 'text', required: true },
        subheading: { type: 'text' },
        backgroundImage: { type: 'upload', relationTo: 'media' },
        ctaButton: {
          type: 'group',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'link', type: 'text' },
          ],
        },
      },
      defaultProps: {
        style: {
          height: '70vh',
          textAlignment: 'center',
        },
      },
      variants: {
        fullscreen: {
          style: {
            height: '100vh',
          },
        },
        minimal: {
          style: {
            height: '50vh',
          },
        },
      },
    },
  },
};
