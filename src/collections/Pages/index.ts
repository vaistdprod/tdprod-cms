import { CollectionConfig } from 'payload'
import {
  HeroBlock,
  TextContentBlock,
  TeamGridBlock,
  ServiceGridBlock,
  ContactFormBlock,
  TestimonialsGridBlock,
  FAQBlock,
} from '../../blocks'
import { superAdminOrTenantAdminAccess } from './access/superAdminOrTenantAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: superAdminOrTenantAdminAccess,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
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
      admin: {
        description: 'URL-friendly version of the title (e.g., "about-us")',
      },
    },
    {
      name: 'uniqueSlug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (data?.slug && data?.associatedTenant) {
              return `${data.slug}-${data.associatedTenant}`
            }
            return value
          }
        ]
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'pageType',
      type: 'select',
      options: [
        { label: 'Standard Page', value: 'standard' },
        { label: 'Landing Page', value: 'landing' },
        { label: 'Blog Post', value: 'blog' },
        { label: 'Service Page', value: 'service' },
        { label: 'Contact Page', value: 'contact' },
      ],
      defaultValue: 'standard',
      admin: {
        description: 'Type of page - affects available blocks and layout options',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroBlock,
        TextContentBlock,
        TeamGridBlock,
        ServiceGridBlock,
        ContactFormBlock,
        TestimonialsGridBlock,
        FAQBlock,
      ],
      admin: {
        description: 'Build your page by adding and arranging content blocks',
      },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Override the default page title for SEO',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Meta description for search engines',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          admin: {
            description: 'Comma-separated keywords for search engines',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Social media sharing image',
          },
        },
      ],
    },
    {
      name: 'associatedTenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'customCSS',
      type: 'code',
      admin: {
        language: 'css',
        description: 'Add custom CSS styles for this page',
      },
    },
    {
      name: 'navigation',
      type: 'group',
      fields: [
        {
          name: 'showInMainNav',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show this page in the main navigation',
          },
        },
        {
          name: 'navOrder',
          type: 'number',
          admin: {
            description: 'Order in the navigation menu',
            condition: (data) => Boolean(data?.navigation?.showInMainNav),
          },
        },
        {
          name: 'navLabel',
          type: 'text',
          admin: {
            description: 'Custom label for navigation (defaults to page title)',
            condition: (data) => Boolean(data?.navigation?.showInMainNav),
          },
        },
        {
          name: 'parentPage',
          type: 'relationship',
          relationTo: 'pages',
          hasMany: false,
          admin: {
            description: 'Parent page for nested navigation',
            condition: (data) => Boolean(data?.navigation?.showInMainNav),
          },
          filterOptions: ({ data }) => ({
            associatedTenant: {
              equals: data?.associatedTenant
            }
          }),
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Date when the page was first published',
        condition: (data) => data?.status === 'published',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data }: { req: any; data: any }) => {
        const user = req.user as { tenants?: { tenant: string }[] } | null
        if (user?.tenants?.[0]) {
          return {
            ...data,
            associatedTenant: user.tenants[0].tenant,
          }
        }
        return data
      },
    ],
  },
}
