import { CollectionConfig } from 'payload'
import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from './access/updateAndDelete'
import { handleDomainChange } from '@/utilities/manageDomains'

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
    group: 'Configuration',
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
        description: 'Custom domain for this tenant (e.g., www.example.com)',
      },
      hooks: {
        beforeChange: [
          async ({ req, data, originalDoc }) => {
            // Skip for new documents as we need the tenant ID
            if (!originalDoc || !data) return data

            const oldDomain = originalDoc.domain
            const newDomain = data.domain

            // Only proceed if domain has changed
            if (oldDomain !== newDomain && originalDoc.id) {
              const result = await handleDomainChange(originalDoc.id, newDomain || null, oldDomain || null)
              if (!result.success) {
                throw new Error(`Domain change failed: ${result.error}`)
              }
              
              // Store verification details if provided
              if (result.verificationDetails) {
                data.domainVerificationDetails = result.verificationDetails
              }
            }
            return data
          }
        ]
      }
    },
    {
      name: 'domainVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Indicates if the custom domain has been verified',
        readOnly: true,
      },
    },
    {
      name: 'domainVerificationDetails',
      type: 'json',
      admin: {
        description: 'DNS records needed for domain verification',
        readOnly: true,
        hidden: true,
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
      name: 'layout',
      type: 'group',
      fields: [
        {
          name: 'headerStyle',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Full Width', value: 'full' },
          ],
        },
        {
          name: 'footerStyle',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Simple', value: 'simple' },
            { label: 'Full Width', value: 'full' },
          ],
        },
        {
          name: 'navigationStyle',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Mega Menu', value: 'mega' },
            { label: 'Sidebar', value: 'sidebar' },
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
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'defaultTitle',
          type: 'text',
          admin: {
            description: 'Default page title suffix',
          },
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          admin: {
            description: 'Default meta description',
          },
        },
        {
          name: 'defaultKeywords',
          type: 'text',
          admin: {
            description: 'Default meta keywords',
          },
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
