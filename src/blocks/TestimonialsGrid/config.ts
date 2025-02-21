import { Block } from 'payload';

export const TestimonialsGridBlock: Block = {
  slug: 'testimonialsGrid',
  labels: {
    singular: 'Testimonials Grid',
    plural: 'Testimonials Grids',
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
      name: 'testimonials',
      type: 'array',
      fields: [
        {
          name: 'author',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
        },
        {
          name: 'rating',
          type: 'select',
          options: [
            { label: '5 Stars', value: '5' },
            { label: '4 Stars', value: '4' },
            { label: '3 Stars', value: '3' },
            { label: '2 Stars', value: '2' },
            { label: '1 Star', value: '1' },
          ],
          defaultValue: '5',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
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
          defaultValue: 'grid',
          options: [
            {
              label: 'Grid',
              value: 'grid',
            },
            {
              label: 'Carousel',
              value: 'carousel',
            },
            {
              label: 'Masonry',
              value: 'masonry',
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
          name: 'showRatings',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'showImages',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
};
