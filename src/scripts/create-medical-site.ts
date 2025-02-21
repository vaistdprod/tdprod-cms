import { medicalTemplate } from '../templates/medical/implementation';
import { MedicalSite, MedicalSiteConfig } from '../templates/medical';
import { TemplateImplementation, TemplateOptions } from '../templates';
import { styleRegistry } from '../system';

/**
 * Creates a new medical practice site with the given configuration and options.
 * 
 * @param config The medical site configuration
 * @param options Optional template options
 * @returns The generated site configuration
 */
export async function createMedicalSite(
  config: MedicalSiteConfig,
  options?: TemplateOptions
) {
  try {
    const template = medicalTemplate as TemplateImplementation<MedicalSite>;

    // Validate the configuration
    const validation = template.validate?.(config);
    if (validation && typeof validation !== 'boolean' && !validation.valid) {
      throw new Error(`Invalid configuration:\n${validation.errors.join('\n')}`);
    }

    // Create the site using the medical template
    const site = template.create(config, options);

    // Register the theme with the style registry
    styleRegistry.registerTheme(config.practiceName, site.theme);

    // Generate SEO metadata
    const structuredData = template.utils?.generateStructuredData?.(config);
    const sitemapEntries = template.utils?.generateSitemapEntries?.(config) || [];
    const robotsTxt = template.utils?.generateRobotsTxt?.(config);

    // Return the complete site configuration
    return {
      ...site,
      seo: {
        ...site.config.seo,
        structuredData,
        sitemap: sitemapEntries,
        robotsTxt,
      },
    };
  } catch (error) {
    console.error('Error creating medical site:', error);
    throw error;
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { createMedicalSite } from './scripts/create-medical-site';
 * import { pediatricianConfig } from './templates/medical/examples/pediatrician';
 * 
 * const options = {
 *   seo: {
 *     titleSuffix: ' | Best Pediatric Care in Sunnyville',
 *   },
 *   analytics: {
 *     provider: 'google',
 *     id: 'G-XXXXXXXXXX',
 *   },
 *   features: {
 *     darkMode: true,
 *     multilingual: {
 *       enabled: true,
 *       defaultLocale: 'en',
 *       locales: ['en', 'es'],
 *     },
 *   },
 *   deployment: {
 *     platform: 'vercel',
 *     config: {
 *       projectId: 'your-project-id',
 *       teamId: 'your-team-id',
 *     },
 *   },
 * };
 * 
 * async function main() {
 *   try {
 *     const site = await createMedicalSite(pediatricianConfig, options);
 *     console.log('Site created successfully:', site);
 *   } catch (error) {
 *     console.error('Failed to create site:', error);
 *   }
 * }
 * 
 * main();
 * ```
 */

// Example command-line usage
if (require.main === module) {
  const options: TemplateOptions = {
    seo: {
      titleSuffix: ' | Best Pediatric Care in Sunnyville',
    },
    analytics: {
      provider: 'google',
      id: 'G-XXXXXXXXXX',
    },
    features: {
      darkMode: true,
      multilingual: {
        enabled: true,
        defaultLocale: 'en',
        locales: ['en', 'es'],
      },
    },
    deployment: {
      platform: 'vercel',
      config: {
        projectId: 'sunshine-pediatrics',
        teamId: 'your-team-id',
      },
    },
  };

  createMedicalSite(require('../templates/medical/examples/pediatrician').pediatricianConfig, options)
    .then((site) => {
      console.log('Site created successfully!');
      console.log('Theme registered:', site.theme);
      console.log('Pages generated:', Object.keys(site.pages || {}).length);
      console.log('SEO metadata generated:', {
        structuredData: !!site.seo.structuredData,
        sitemap: site.seo.sitemap.length,
        robotsTxt: !!site.seo.robotsTxt,
      });
    })
    .catch((error) => {
      console.error('Failed to create site:', error);
      process.exit(1);
    });
}
