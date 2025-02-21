import { CollectionConfig } from 'payload';
import { baseTemplate } from '../base/baseTemplate';
import { Theme, Layout } from '../types';

interface HealthcareSpecificFields {
  appointmentTypes?: {
    name: string;
    duration: number;
    description?: string;
    price?: number;
  }[];
  specialties?: string[];
  insuranceAccepted?: string[];
}

export interface HealthcareTemplate extends Omit<typeof baseTemplate, 'collections'> {
  collections: typeof baseTemplate['collections'] & {
    appointments: CollectionConfig;
    patients: CollectionConfig;
    medicalServices: CollectionConfig;
  };
  healthcareFields: HealthcareSpecificFields;
}

export const healthcareTemplate: HealthcareTemplate = {
  ...baseTemplate,
  name: 'Healthcare Template',
  slug: 'healthcare',
  theme: {
    ...baseTemplate.theme,
    colors: {
      primary: '#0077B6',
      secondary: '#48CAE4',
      accent: '#00B4D8',
      background: '#ffffff',
      text: '#03045E',
    },
  },
  collections: {
    ...baseTemplate.collections,
    appointments: {
      slug: 'appointments',
      admin: {
        useAsTitle: 'patientName',
        defaultColumns: ['patientName', 'appointmentType', 'date', 'status'],
      },
      fields: [
        {
          name: 'patientName',
          type: 'text',
          required: true,
        },
        {
          name: 'appointmentType',
          type: 'select',
          required: true,
          options: [
            { label: 'Initial Consultation', value: 'initial' },
            { label: 'Follow-up', value: 'followup' },
            { label: 'Procedure', value: 'procedure' },
          ],
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'scheduled',
          options: [
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
    patients: {
      slug: 'patients',
      admin: {
        useAsTitle: 'fullName',
        defaultColumns: ['fullName', 'email', 'phone'],
      },
      fields: [
        {
          name: 'fullName',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
        },
        {
          name: 'dateOfBirth',
          type: 'date',
          required: true,
        },
        {
          name: 'insurance',
          type: 'group',
          fields: [
            {
              name: 'provider',
              type: 'text',
            },
            {
              name: 'policyNumber',
              type: 'text',
            },
          ],
        },
        {
          name: 'medicalHistory',
          type: 'array',
          fields: [
            {
              name: 'condition',
              type: 'text',
            },
            {
              name: 'diagnosisDate',
              type: 'date',
            },
            {
              name: 'notes',
              type: 'textarea',
            },
          ],
        },
      ],
    },
    medicalServices: {
      slug: 'medical-services',
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
          name: 'description',
          type: 'richText',
          required: true,
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Primary Care', value: 'primary' },
            { label: 'Specialized Care', value: 'specialized' },
            { label: 'Preventive Care', value: 'preventive' },
            { label: 'Diagnostic', value: 'diagnostic' },
          ],
        },
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Duration in minutes',
          },
        },
        {
          name: 'price',
          type: 'number',
          admin: {
            description: 'Price in USD',
          },
        },
        {
          name: 'insuranceCovered',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  },
  components: {
    ...baseTemplate.components,
    AppointmentScheduler: {
      schema: {
        title: { type: 'text', required: true },
        description: { type: 'textarea' },
        availableServices: {
          type: 'relationship',
          relationTo: 'medical-services',
          hasMany: true,
        },
        showInsuranceField: { type: 'checkbox', defaultValue: true },
      },
      defaultProps: {
        style: {
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
        },
      },
    },
    DoctorProfile: {
      schema: {
        name: { type: 'text', required: true },
        title: { type: 'text', required: true },
        image: { type: 'upload', relationTo: 'media' },
        specialties: { type: 'array', fields: [{ name: 'specialty', type: 'text' }] },
        education: { type: 'array', fields: [{ name: 'degree', type: 'text' }] },
        bio: { type: 'richText' },
      },
      defaultProps: {
        style: {
          padding: '2rem',
          borderRadius: '8px',
          backgroundColor: 'var(--background-alt)',
        },
      },
    },
    InsuranceInfo: {
      schema: {
        title: { type: 'text', required: true },
        acceptedProviders: {
          type: 'array',
          fields: [
            { name: 'provider', type: 'text' },
            { name: 'plans', type: 'array', fields: [{ name: 'plan', type: 'text' }] },
          ],
        },
        disclaimer: { type: 'textarea' },
      },
      defaultProps: {
        style: {
          padding: '2rem',
          backgroundColor: 'var(--background-light)',
        },
      },
    },
  },
  healthcareFields: {
    appointmentTypes: [
      {
        name: 'Initial Consultation',
        duration: 60,
        description: 'First-time patient consultation',
        price: 150,
      },
      {
        name: 'Follow-up Visit',
        duration: 30,
        description: 'Regular follow-up appointment',
        price: 100,
      },
      {
        name: 'Annual Physical',
        duration: 45,
        description: 'Comprehensive yearly check-up',
        price: 200,
      },
    ],
    specialties: [
      'Family Medicine',
      'Internal Medicine',
      'Pediatrics',
      'Cardiology',
      'Dermatology',
    ],
    insuranceAccepted: [
      'Blue Cross Blue Shield',
      'Aetna',
      'UnitedHealthcare',
      'Cigna',
      'Medicare',
      'Medicaid',
    ],
  },
};
