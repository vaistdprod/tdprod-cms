import { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'buttons',
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
          name: 'style',
          type: 'select',
          options: [
            {
              label: 'Primary',
              value: 'primary',
            },
            {
              label: 'Secondary',
              value: 'secondary',
            },
            {
              label: 'Text',
              value: 'text',
            },
          ],
          defaultValue: 'primary',
        },
      ],
    },
    {
      name: 'style',
      type: 'group',
      fields: [
        {
          name: 'textColor',
          type: 'text',
          admin: {
            description: 'Hex color or CSS variable',
          },
        },
        {
          name: 'backgroundColor',
          type: 'text',
          admin: {
            description: 'Hex color or CSS variable',
          },
        },
        {
          name: 'textAlignment',
          type: 'select',
          options: [
            {
              label: 'Left',
              value: 'left',
            },
            {
              label: 'Center',
              value: 'center',
            },
            {
              label: 'Right',
              value: 'right',
            },
          ],
          defaultValue: 'center',
        },
        {
          name: 'padding',
          type: 'group',
          fields: [
            {
              name: 'top',
              type: 'text',
              defaultValue: '4rem',
            },
            {
              name: 'bottom',
              type: 'text',
              defaultValue: '4rem',
            },
          ],
        },
        {
          name: 'backgroundOverlay',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'color',
              type: 'text',
              admin: {
                description: 'Hex color with opacity (e.g., #00000080)',
                condition: (data, siblingData) => siblingData?.enabled,
              },
            },
          ],
        },
        {
          name: 'height',
          type: 'select',
          options: [
            {
              label: 'Auto',
              value: 'auto',
            },
            {
              label: 'Full Screen',
              value: '100vh',
            },
            {
              label: '75% Screen',
              value: '75vh',
            },
            {
              label: '50% Screen',
              value: '50vh',
            },
          ],
          defaultValue: 'auto',
        },
      ],
    },
  ],
}
