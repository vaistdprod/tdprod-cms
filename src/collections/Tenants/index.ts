import type { CollectionConfig } from 'payload'

import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from './access/updateAndDelete'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: isSuperAdminAccess,
    delete: updateAndDeleteAccess,
    read: ({ req }) => Boolean(req.user),
    update: updateAndDeleteAccess,
  },
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
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Used for domain-based tenant handling',
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Used for url paths, example: /tenant-slug/page-slug',
      },
      index: true,
      required: true,
    },
    {
      name: 'businessType',
      type: 'select',
      required: true,
      options: [
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Legal', value: 'legal' },
        { label: 'Non-Profit', value: 'non-profit' },
        { label: 'Professional Services', value: 'professional' },
        { label: 'Education', value: 'education' },
        { label: 'Other', value: 'other' }
      ],
      admin: {
        description: 'Type of business this tenant represents',
      },
    },
    {
      name: 'features',
      type: 'group',
      fields: [
        {
          name: 'blog',
          type: 'checkbox',
          label: 'Enable Blog',
          defaultValue: false,
        },
        {
          name: 'team',
          type: 'checkbox',
          label: 'Enable Team Section',
          defaultValue: true,
        },
        {
          name: 'services',
          type: 'checkbox',
          label: 'Enable Services Section',
          defaultValue: true,
        },
        {
          name: 'testimonials',
          type: 'checkbox',
          label: 'Enable Testimonials',
          defaultValue: true,
        },
        {
          name: 'appointments',
          type: 'checkbox',
          label: 'Enable Appointment Booking',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'theme',
      type: 'group',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#007bff',
          admin: {
            description: 'Primary brand color (hex code)',
          },
        },
        {
          name: 'secondaryColor',
          type: 'text',
          defaultValue: '#6c757d',
          admin: {
            description: 'Secondary brand color (hex code)',
          },
        },
        {
          name: 'fontFamily',
          type: 'select',
          defaultValue: 'inter',
          options: [
            { label: 'Inter', value: 'inter' },
            { label: 'Montserrat', value: 'montserrat' },
            { label: 'Roboto', value: 'roboto' },
            { label: 'Open Sans', value: 'open-sans' },
          ],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'address',
          type: 'textarea',
        },
        {
          name: 'socialMedia',
          type: 'array',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'Twitter', value: 'twitter' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'YouTube', value: 'youtube' },
              ],
            },
            {
              name: 'url',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'allowPublicRead',
      type: 'checkbox',
      admin: {
        description:
          'If checked, logging in is not required to read. Useful for building public pages.',
        position: 'sidebar',
      },
      defaultValue: false,
      index: true,
    },
  ],
}
