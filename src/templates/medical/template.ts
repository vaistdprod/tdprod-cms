import { medicalTheme } from './theme';
import { AppointmentSchedulerProps } from './components/AppointmentScheduler';
import { ComponentImplementation, ComponentProps } from '../../system';

// Define the structure of a medical practice site
export interface MedicalSiteConfig {
  // Basic information
  practiceName: string;
  tagline?: string;
  logo?: string;

  // System configuration
  analytics?: {
    provider: 'google' | 'plausible' | 'fathom';
    id: string;
  };
  i18n?: {
    defaultLocale: string;
    locales: string[];
  };
  search?: {
    provider: 'algolia' | 'meilisearch';
    config?: Record<string, any>;
  };
  deployment?: {
    platform?: 'vercel' | 'netlify' | 'aws';
    config?: Record<string, any>;
  };
  
  // Contact information
  contact: {
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };

  // Hours of operation
  hours: {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']?: {
      open: string;
      close: string;
    };
  };

  // Services offered
  services: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price?: number;
    image?: string;
    category?: string;
  }>;

  // Medical team
  team: Array<{
    id: string;
    name: string;
    title: string;
    specialty: string;
    image?: string;
    bio?: string;
    education?: string[];
    certifications?: string[];
    languages?: string[];
  }>;

  // Insurance information
  insurance: {
    acceptedProviders: string[];
    verificationUrl?: string;
    notes?: string;
  };

  // Appointment scheduling
  appointments: {
    scheduler: AppointmentSchedulerProps;
    policies?: {
      cancellation?: string;
      noShow?: string;
      payment?: string;
    };
  };

  // Content sections
  content: {
    hero: {
      title: string;
      subtitle?: string;
      image?: string;
      cta?: {
        text: string;
        action: string;
      };
    };
    about: {
      title: string;
      content: string;
      image?: string;
      highlights?: Array<{
        title: string;
        description: string;
        icon?: string;
      }>;
    };
    testimonials?: Array<{
      id: string;
      author: string;
      content: string;
      rating?: number;
      image?: string;
      date?: string;
    }>;
    faq?: Array<{
      question: string;
      answer: string;
      category?: string;
    }>;
    blog?: {
      enabled: boolean;
      categories?: string[];
      featuredPosts?: string[];
    };
  };

  // SEO and metadata
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    structuredData?: {
      type: 'MedicalBusiness' | 'Physician' | 'MedicalClinic';
      specialty?: string;
      medicalSpecialty?: string[];
      [key: string]: any;
    };
    // Additional SEO configuration
    titleSuffix?: string;
    defaultMetaTags?: Record<string, string>;
  };

  // Page configuration
  pages?: Record<string, {
    path: string;
    sections: Array<{
      type: string;
      props: Record<string, any>;
    }>;
  }>;

  // Theme customization
  theme: {
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
    components?: {
      buttons?: {
        primary?: React.CSSProperties;
        secondary?: React.CSSProperties;
      };
      cards?: React.CSSProperties;
      forms?: React.CSSProperties;
    };
  };

  // Features configuration
  features: {
    onlineAppointments: boolean;
    patientPortal?: {
      enabled: boolean;
      features?: Array<'appointments' | 'records' | 'messaging' | 'billing' | 'prescriptions'>;
    };
    telemedicine?: {
      enabled: boolean;
      provider?: string;
      pricing?: {
        amount: number;
        currency: string;
      };
    };
    forms?: {
      newPatient?: boolean;
      insuranceVerification?: boolean;
      medicalHistory?: boolean;
    };
  };
}

// Create a default medical template
export const createMedicalTemplate = (config: MedicalSiteConfig) => {
  // Filter out undefined sections before creating pages
  const createSections = (sections: Array<{ type: string; props: Record<string, any>; } | undefined>) => {
    return sections.filter((section): section is { type: string; props: Record<string, any>; } => 
      section !== undefined
    );
  };

  return {
    theme: medicalTheme,
    config,
    pages: config.pages || {
      home: {
        path: '/',
        sections: createSections([
          {
            type: 'hero',
            props: {
              title: config.content.hero.title,
              subtitle: config.content.hero.subtitle,
              image: config.content.hero.image,
              cta: config.content.hero.cta,
            },
          },
          {
            type: 'services',
            props: {
              services: config.services,
            },
          },
          {
            type: 'team',
            props: {
              team: config.team,
            },
          },
          config.content.testimonials && {
            type: 'testimonials',
            props: {
              testimonials: config.content.testimonials,
            },
          },
        ]),
      },
      about: {
        path: '/about',
        sections: createSections([
          {
            type: 'content',
            props: config.content.about,
          },
          {
            type: 'team',
            props: {
              team: config.team,
              detailed: true,
            },
          },
        ]),
      },
      services: {
        path: '/services',
        sections: createSections([
          {
            type: 'services',
            props: {
              services: config.services,
              detailed: true,
            },
          },
          {
            type: 'insurance',
            props: config.insurance,
          },
        ]),
      },
      appointments: {
        path: '/appointments',
        sections: createSections([
          {
            type: 'scheduler',
            props: config.appointments.scheduler,
          },
          config.appointments.policies && {
            type: 'policies',
            props: config.appointments.policies,
          },
        ]),
      },
      contact: {
        path: '/contact',
        sections: createSections([
          {
            type: 'contact',
            props: {
              contact: config.contact,
              hours: config.hours,
            },
          },
          {
            type: 'map',
            props: {
              address: config.contact.address,
            },
          },
        ]),
      },
    },
  };
};
