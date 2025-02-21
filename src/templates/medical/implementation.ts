import { TemplateImplementation, TemplateOptions, createTemplate } from '../';
import { MedicalSite, MedicalSiteConfig } from './';
import { medicalTheme } from './theme';
import { createMedicalTemplate } from './template';

export const medicalTemplate = createTemplate<MedicalSite>({
  id: 'medical',
  name: 'Medical Practice Template',
  description: 'A comprehensive template for medical practices, clinics, and healthcare providers',
  version: '1.0.0',
  category: 'healthcare',

  create: (config: MedicalSiteConfig, options?: TemplateOptions): MedicalSite => {
    const site = createMedicalTemplate(config);

    // Apply template options if provided
    if (options) {
      // Add SEO suffix to all page titles
      if (options.seo?.titleSuffix) {
        site.config.seo.title += options.seo.titleSuffix;
      }

      // Add analytics configuration
      if (options.analytics) {
        site.config = {
          ...site.config,
          analytics: options.analytics,
        };
      }

      // Configure multilingual support
      if (options.features?.multilingual?.enabled) {
        site.config = {
          ...site.config,
          i18n: {
            defaultLocale: options.features.multilingual.defaultLocale || 'en',
            locales: options.features.multilingual.locales || ['en'],
          },
        };
      }

      // Configure search functionality
      if (options.features?.search?.enabled) {
        site.config = {
          ...site.config,
          search: {
            provider: options.features.search.provider || 'algolia',
            ...options.features.search.config,
          },
        };
      }

      // Add deployment configuration
      if (options.deployment) {
        site.config = {
          ...site.config,
          deployment: options.deployment,
        };
      }
    }

    return site;
  },

  validate: (config: MedicalSiteConfig) => {
    const errors: string[] = [];

    // Validate basic information
    if (!config.practiceName) {
      errors.push('Practice name is required');
    }

    // Validate contact information
    if (!config.contact?.phone || !config.contact?.email) {
      errors.push('Contact phone and email are required');
    }

    if (!config.contact?.address?.street || !config.contact?.address?.city || 
        !config.contact?.address?.state || !config.contact?.address?.zip) {
      errors.push('Complete address information is required');
    }

    // Validate services
    if (!config.services?.length) {
      errors.push('At least one service must be defined');
    }

    // Validate team members
    if (!config.team?.length) {
      errors.push('At least one team member must be defined');
    }

    // Validate appointments configuration
    if (!config.appointments?.scheduler) {
      errors.push('Appointment scheduler configuration is required');
    }

    // Validate content sections
    if (!config.content?.hero?.title || !config.content?.about?.content) {
      errors.push('Hero and About content sections are required');
    }

    // Validate SEO configuration
    if (!config.seo?.title || !config.seo?.description || !config.seo?.keywords?.length) {
      errors.push('Complete SEO configuration is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  extend: (base: MedicalSite, overrides: Partial<MedicalSite>): MedicalSite => {
    return {
      theme: {
        ...base.theme,
        ...overrides.theme,
      },
      config: {
        ...base.config,
        ...overrides.config,
      },
      pages: {
        ...base.pages,
        ...overrides.pages,
      },
    };
  },

  utils: {
    // Helper to generate schema.org structured data
    generateStructuredData: (config: MedicalSiteConfig) => {
      return {
        '@context': 'https://schema.org',
        '@type': config.seo.structuredData?.type || 'MedicalBusiness',
        name: config.practiceName,
        description: config.seo.description,
        url: `https://${config.contact.address.city.toLowerCase()}.${config.practiceName.toLowerCase().replace(/\s+/g, '')}.com`,
        telephone: config.contact.phone,
        email: config.contact.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: config.contact.address.street,
          addressLocality: config.contact.address.city,
          addressRegion: config.contact.address.state,
          postalCode: config.contact.address.zip,
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          // Would need to be provided in config or looked up
          latitude: '0',
          longitude: '0',
        },
        openingHours: Object.entries(config.hours)
          .map(([day, hours]) => 
            hours ? `${day.slice(0, 2).toUpperCase()} ${hours.open}-${hours.close}` : null
          )
          .filter(Boolean),
        medicalSpecialty: config.seo.structuredData?.medicalSpecialty || [],
      };
    },

    // Helper to generate sitemap entries
    generateSitemapEntries: (config: MedicalSiteConfig) => {
      const baseUrl = `https://${config.contact.address.city.toLowerCase()}.${config.practiceName.toLowerCase().replace(/\s+/g, '')}.com`;
      
      if (!config.pages) {
        // Return default sitemap entries if no pages are defined
        return [
          { url: baseUrl, changefreq: 'weekly', priority: 1.0 },
          { url: `${baseUrl}/about`, changefreq: 'weekly', priority: 0.8 },
          { url: `${baseUrl}/services`, changefreq: 'weekly', priority: 0.8 },
          { url: `${baseUrl}/appointments`, changefreq: 'weekly', priority: 0.8 },
          { url: `${baseUrl}/contact`, changefreq: 'weekly', priority: 0.8 },
        ];
      }

      return Object.entries(config.pages).map(([_, page]) => ({
        url: `${baseUrl}${page.path}`,
        changefreq: 'weekly',
        priority: page.path === '/' ? 1.0 : 0.8,
      }));
    },

    // Helper to generate robots.txt content
    generateRobotsTxt: (config: MedicalSiteConfig) => {
      const baseUrl = `https://${config.contact.address.city.toLowerCase()}.${config.practiceName.toLowerCase().replace(/\s+/g, '')}.com`;
      
      return `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
      `.trim();
    },
  },
});
