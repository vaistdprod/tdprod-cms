import { CollectionConfig } from 'payload'
import { PayloadRequest } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order'],
  },
  access: {
    read: async ({ req }: { req: PayloadRequest }) => {
      if (!req.user) return true
      return {
        tenant: {
          in: req.user.tenants?.map((t) => t.tenant) || [],
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      required: true,
    },
  ],
}
