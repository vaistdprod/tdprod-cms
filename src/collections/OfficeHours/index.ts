import { CollectionConfig } from 'payload'
import { PayloadRequest } from 'payload'

export const OfficeHours: CollectionConfig = {
  slug: 'office-hours',
  admin: {
    useAsTitle: 'dayOfWeek',
    defaultColumns: ['dayOfWeek', 'openTime', 'closeTime', 'isClosed'],
  },
  access: {
    read: async ({ req }: { req: PayloadRequest }) => {
      if (!req.user) return true
      return {
        associatedTenant: {
          in: req.user.tenants?.map((t) => t.tenant) || [],
        },
      }
    },
  },
  fields: [
    {
      name: 'dayOfWeek',
      type: 'select',
      required: true,
      options: [
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
        { label: 'Sunday', value: 'sunday' },
      ],
    },
    {
      name: 'openTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Opening time (e.g., 09:00)',
      },
    },
    {
      name: 'closeTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Closing time (e.g., 17:00)',
      },
    },
    {
      name: 'isClosed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check if clinic is closed on this day',
      },
    },
    {
      name: 'specialNote',
      type: 'text',
      admin: {
        description: 'Any special notes for this day (e.g., By appointment only)',
      },
    },
    {
      name: 'associatedTenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      hasMany: false,
    },
  ],
}
