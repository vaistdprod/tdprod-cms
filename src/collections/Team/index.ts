import type { CollectionConfig } from 'payload/types';
import { isAccessingSelf } from '../Users/access/isAccessingSelf';
import { superAdminOrTenantAdminAccess } from '../Pages/access/superAdminOrTenantAdmin';

export const Team: CollectionConfig = {
  slug: 'team',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'specialization'],
  },
  access: {
    read: () => true,
    create: superAdminOrTenantAdminAccess,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
    },
    {
      name: 'specialization',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'education',
      type: 'array',
      fields: [
        {
          name: 'degree',
          type: 'text',
          required: true,
        },
        {
          name: 'institution',
          type: 'text',
          required: true,
        },
        {
          name: 'year',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'certifications',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'issuer',
          type: 'text',
          required: true,
        },
        {
          name: 'year',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'languages',
      type: 'array',
      fields: [
        {
          name: 'language',
          type: 'text',
          required: true,
        },
        {
          name: 'level',
          type: 'select',
          options: [
            {
              label: 'Native',
              value: 'native',
            },
            {
              label: 'Fluent',
              value: 'fluent',
            },
            {
              label: 'Professional',
              value: 'professional',
            },
            {
              label: 'Basic',
              value: 'basic',
            },
          ],
          required: true,
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        description: 'Use this to control the order of team members on the website',
      },
    },
  ],
};
