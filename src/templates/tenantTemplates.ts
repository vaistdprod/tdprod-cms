import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { Services } from '@/collections/Services'
import { Team } from '@/collections/Team'
import { Testimonials } from '@/collections/Testimonials'
import { Tenant } from '../payload-types'

export type BusinessTemplate = {
  features: Required<NonNullable<Tenant['features']>>
  theme: {
    primaryColor: NonNullable<Tenant['theme']>['primaryColor']
    secondaryColor: NonNullable<Tenant['theme']>['secondaryColor']
    fontFamily: NonNullable<Required<NonNullable<Tenant['theme']>>>['fontFamily']
  }
  defaultPages: Array<{
    title: string
    slug: string
    layout: any[] // Will be populated with specific blocks based on page type
  }>
  defaultCollections: {
    services?: any[]
    team?: any[]
    testimonials?: any[]
    posts?: any[]
  }
}

export const businessTemplates: Record<Tenant['businessType'], BusinessTemplate> = {
  healthcare: {
    features: {
      blog: true,
      team: true,
      services: true,
      testimonials: true,
      appointments: true,
    },
    theme: {
      primaryColor: '#0077B6',
      secondaryColor: '#48CAE4',
      fontFamily: 'inter',
    },
    defaultPages: [
      {
        title: 'Home',
        slug: 'home',
        layout: [
          {
            blockType: 'hero',
            heading: 'Welcome to [Practice Name]',
            subheading: 'Your Trusted Healthcare Partner',
            style: {
              textAlignment: 'center',
              height: '75vh',
              padding: { top: '4rem', bottom: '4rem' }
            }
          },
          {
            blockType: 'serviceGrid',
            heading: 'Our Services',
            description: 'Comprehensive healthcare services tailored to your needs'
          },
          {
            blockType: 'teamGrid',
            heading: 'Meet Our Team',
            description: 'Experienced healthcare professionals dedicated to your well-being'
          },
          {
            blockType: 'testimonialGrid',
            heading: 'Patient Testimonials',
            description: 'What our patients say about us'
          }
        ]
      }
    ],
    defaultCollections: {
      services: [
        {
          title: 'General Checkups',
          description: 'Comprehensive health assessments and preventive care',
          icon: 'stethoscope',
          order: 1,
        },
        {
          title: 'Specialized Care',
          description: 'Expert treatment for specific health conditions',
          icon: 'heart',
          order: 2,
        }
      ],
      team: [
        {
          name: 'Dr. [Name]',
          role: 'Lead Physician',
          specialization: 'General Medicine',
          bio: 'Board-certified physician with over 10 years of experience',
          order: 1,
        }
      ],
      testimonials: [
        {
          author: 'John D.',
          content: 'Excellent care and professional staff. Highly recommended!',
          rating: '5',
        }
      ]
    }
  },
  legal: {
    features: {
      blog: true,
      team: true,
      services: true,
      testimonials: true,
      appointments: false,
    },
    theme: {
      primaryColor: '#2C3E50',
      secondaryColor: '#34495E',
      fontFamily: 'montserrat',
    },
    defaultPages: [
      {
        title: 'Home',
        slug: 'home',
        layout: [
          {
            blockType: 'hero',
            heading: 'Welcome to [Law Firm Name]',
            subheading: 'Expert Legal Solutions',
            style: {
              textAlignment: 'center',
              height: '75vh',
              padding: { top: '4rem', bottom: '4rem' }
            }
          },
          {
            blockType: 'serviceGrid',
            heading: 'Practice Areas',
            description: 'Comprehensive legal services for your needs'
          },
          {
            blockType: 'testimonialGrid',
            heading: 'Client Testimonials',
            description: 'What our clients say about us'
          }
        ]
      }
    ],
    defaultCollections: {
      services: [
        {
          title: 'Corporate Law',
          description: 'Comprehensive legal solutions for businesses',
          icon: 'building',
          order: 1,
        },
        {
          title: 'Civil Litigation',
          description: 'Expert representation in civil matters',
          icon: 'gavel',
          order: 2,
        }
      ],
      team: [
        {
          name: '[Name]',
          role: 'Senior Partner',
          specialization: 'Corporate Law',
          bio: 'Experienced attorney specializing in corporate law',
          order: 1,
        }
      ]
    }
  },
  'non-profit': {
    features: {
      blog: true,
      team: true,
      services: false,
      testimonials: true,
      appointments: false,
    },
    theme: {
      primaryColor: '#38A169',
      secondaryColor: '#48BB78',
      fontFamily: 'open-sans',
    },
    defaultPages: [
      {
        title: 'Home',
        slug: 'home',
        layout: [
          {
            blockType: 'hero',
            heading: 'Welcome to [Organization Name]',
            subheading: 'Making a Difference Together',
            style: {
              textAlignment: 'center',
              height: '75vh',
              padding: { top: '4rem', bottom: '4rem' }
            }
          }
        ]
      }
    ],
    defaultCollections: {
      team: [
        {
          name: '[Name]',
          role: 'Executive Director',
          specialization: 'Non-Profit Management',
          bio: 'Passionate leader dedicated to our cause',
          order: 1,
        }
      ],
      testimonials: [
        {
          author: 'Community Member',
          content: 'The impact this organization has made is incredible.',
          rating: '5',
        }
      ]
    }
  },
  professional: {
    features: {
      blog: true,
      team: true,
      services: true,
      testimonials: true,
      appointments: true,
    },
    theme: {
      primaryColor: '#1A365D',
      secondaryColor: '#2B6CB0',
      fontFamily: 'montserrat',
    },
    defaultPages: [
      {
        title: 'Home',
        slug: 'home',
        layout: [
          {
            blockType: 'hero',
            heading: 'Welcome to [Company Name]',
            subheading: 'Professional Services Tailored to Your Needs',
            style: {
              textAlignment: 'center',
              height: '75vh',
              padding: { top: '4rem', bottom: '4rem' }
            }
          }
        ]
      }
    ],
    defaultCollections: {
      services: [
        {
          title: 'Professional Consulting',
          description: 'Expert guidance for your business needs',
          icon: 'briefcase',
          order: 1,
        }
      ],
      team: [
        {
          name: '[Name]',
          role: 'Senior Consultant',
          specialization: 'Business Strategy',
          bio: 'Expert consultant with extensive industry experience',
          order: 1,
        }
      ]
    }
  },
  education: {
    features: {
      blog: true,
      team: true,
      services: true,
      testimonials: true,
      appointments: false,
    },
    theme: {
      primaryColor: '#553C9A',
      secondaryColor: '#6B46C1',
      fontFamily: 'inter',
    },
    defaultPages: [
      {
        title: 'Home',
        slug: 'home',
        layout: [
          {
            blockType: 'hero',
            heading: 'Welcome to [School Name]',
            subheading: 'Empowering Through Education',
            style: {
              textAlignment: 'center',
              height: '75vh',
              padding: { top: '4rem', bottom: '4rem' }
            }
          }
        ]
      }
    ],
    defaultCollections: {
      services: [
        {
          title: 'Academic Programs',
          description: 'Comprehensive educational offerings',
          icon: 'book',
          order: 1,
        }
      ],
      team: [
        {
          name: '[Name]',
          role: 'Department Head',
          specialization: 'Education Administration',
          bio: 'Experienced educator dedicated to student success',
          order: 1,
        }
      ]
    }
  },
  other: {
    features: {
      blog: true,
      team: true,
      services: true,
      testimonials: true,
      appointments: false,
    },
    theme: {
      primaryColor: '#2D3748',
      secondaryColor: '#4A5568',
      fontFamily: 'inter',
    },
    defaultPages: [
      {
        title: 'Home',
        slug: 'home',
        layout: [
          {
            blockType: 'hero',
            heading: 'Welcome to [Business Name]',
            subheading: 'Your Trusted Partner',
            style: {
              textAlignment: 'center',
              height: '75vh',
              padding: { top: '4rem', bottom: '4rem' }
            }
          }
        ]
      }
    ],
    defaultCollections: {
      services: [
        {
          title: 'Our Services',
          description: 'Professional solutions for your needs',
          icon: 'star',
          order: 1,
        }
      ],
      team: [
        {
          name: '[Name]',
          role: 'Team Lead',
          specialization: 'General Management',
          bio: 'Experienced professional dedicated to excellence',
          order: 1,
        }
      ]
    }
  }
}

export const getBusinessTemplate = (businessType: Tenant['businessType']): BusinessTemplate => {
  const template = businessTemplates[businessType]
  if (!template) {
    throw new Error(`No template found for business type: ${businessType}`)
  }
  return template
}
