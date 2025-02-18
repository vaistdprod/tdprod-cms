import { CollectionConfig } from 'payload'
import { HeroBlock } from '../../blocks/Hero/config'
import { TextContentBlock } from '../../blocks/TextContent/config'
import { superAdminOrTenantAdminAccess } from './access/superAdminOrTenantAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
      unique: true,
      index: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroBlock,
        TextContentBlock,
      ],
    },
    {
      name: 'meta',
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
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      hasMany: false,
    },
    {
      name: 'customCSS',
      type: 'code',
      admin: {
        language: 'css',
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
        },
        {
          name: 'navOrder',
          type: 'number',
          admin: {
            condition: (data) => Boolean(data?.navigation?.showInMainNav),
          },
        },
        {
          name: 'navLabel',
          type: 'text',
          admin: {
            condition: (data) => Boolean(data?.navigation?.showInMainNav),
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data }) => {
        const user = req.user as { tenants?: { tenant: string }[] } | null
        if (user?.tenants?.[0]) {
          return {
            ...data,
            tenant: user.tenants[0].tenant,
          }
        }
        return data
      },
    ],
  },
}
