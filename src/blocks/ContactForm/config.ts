import { Block } from 'payload';

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: {
    singular: 'Contact Form',
    plural: 'Contact Forms',
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
      name: 'formType',
      type: 'select',
      defaultValue: 'contact',
      options: [
        {
          label: 'Contact Form',
          value: 'contact',
        },
        {
          label: 'Appointment Request',
          value: 'appointment',
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
          defaultValue: 'split',
          options: [
            {
              label: 'Split with Info',
              value: 'split',
            },
            {
              label: 'Centered',
              value: 'centered',
            },
            {
              label: 'Full Width',
              value: 'full',
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
      ],
    },
    {
      name: 'contactInfo',
      type: 'group',
      fields: [
        {
          name: 'showContactInfo',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show contact information alongside the form',
          },
        },
        {
          name: 'showMap',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show location map',
          },
        },
        {
          name: 'showSocialMedia',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show social media links',
          },
        },
      ],
    },
  ],
};
