import { Block } from 'payload';

export const FAQBlock: Block = {
  slug: 'faq',
  labels: {
    singular: 'FAQ Section',
    plural: 'FAQ Sections',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'textarea',
    },
    {
      name: 'questions',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
        },
        {
          name: 'category',
          type: 'text',
          admin: {
            description: 'Optional category for grouping questions',
          },
        },
      ],
    },
    {
      name: 'style',
      type: 'group',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'accordion',
          options: [
            {
              label: 'Accordion',
              value: 'accordion',
            },
            {
              label: 'Grid',
              value: 'grid',
            },
            {
              label: 'Tabs',
              value: 'tabs',
            },
          ],
        },
        {
          name: 'textAlignment',
          type: 'select',
          defaultValue: 'left',
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
          name: 'background',
          type: 'select',
          defaultValue: 'white',
          options: [
            {
              label: 'White',
              value: 'white',
            },
            {
              label: 'Light',
              value: 'light',
            },
            {
              label: 'Brand',
              value: 'brand',
            },
          ],
        },
        {
          name: 'showCategories',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Group questions by category',
          },
        },
        {
          name: 'expandFirst',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Expand the first question by default',
          },
        },
      ],
    },
  ],
};
