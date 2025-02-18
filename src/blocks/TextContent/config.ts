import { Block } from 'payload'

export const TextContentBlock: Block = {
  slug: 'textContent',
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'columns',
      type: 'select',
      options: [
        {
          label: 'Single Column',
          value: '1',
        },
        {
          label: 'Two Columns',
          value: '2',
        },
      ],
      defaultValue: '1',
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
          name: 'maxWidth',
          type: 'text',
          defaultValue: '65ch',
        },
        {
          name: 'padding',
          type: 'group',
          fields: [
            {
              name: 'top',
              type: 'text',
              defaultValue: '2rem',
            },
            {
              name: 'bottom',
              type: 'text',
              defaultValue: '2rem',
            },
          ],
        },
        {
          name: 'alignment',
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
          ],
          defaultValue: 'left',
        },
      ],
    },
  ],
}
