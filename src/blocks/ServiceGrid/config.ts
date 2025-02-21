import { Block } from 'payload';

export const ServiceGridBlock: Block = {
  slug: 'serviceGrid',
  labels: {
    singular: 'Service Grid',
    plural: 'Service Grids',
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
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        {
          label: 'Grid',
          value: 'grid',
        },
        {
          label: 'List',
          value: 'list',
        },
        {
          label: 'Cards',
          value: 'cards',
        },
        {
          label: 'Features',
          value: 'features',
        },
      ],
    },
    {
      name: 'style',
      type: 'group',
      fields: [
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
            {
              label: 'Right',
              value: 'right',
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
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          options: [
            {
              label: '2 Columns',
              value: '2',
            },
            {
              label: '3 Columns',
              value: '3',
            },
            {
              label: '4 Columns',
              value: '4',
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
      ],
    },
  ],
};
