import { Payload } from 'payload';
import { TenantType, FontFamily } from './types';
import { createEnhancedTenant } from './createEnhancedTenant';

interface CreateNewTenantOptions {
  name: string;
  domain: string;
  type: TenantType;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: FontFamily;
  };
  features?: {
    blog?: boolean;
    team?: boolean;
    services?: boolean;
    testimonials?: boolean;
    appointments?: boolean;
  };
}

export const createNewTenant = async (
  payload: Payload,
  options: CreateNewTenantOptions
) => {
  const { name, domain, type, theme, features } = options;

  // Generate a URL-friendly slug from the name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    // Check if domain is already in use
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        domain: { equals: domain },
      },
    });

    if (existingTenant.totalDocs > 0) {
      throw new Error(`Domain ${domain} is already in use`);
    }

    // Create the tenant using our enhanced system
    const result = await createEnhancedTenant(payload, {
      name,
      slug,
      domain,
      type,
      theme,
      features,
    });

    // Return useful information about the new tenant
    return {
      success: true,
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        domain: result.tenant.domain,
        adminUrl: `/admin/tenants/${result.tenant.id}`,
      },
      admin: {
        email: result.adminUser.email,
        username: result.adminUser.username,
        loginUrl: `/admin/login`,
      },
      pages: result.pages.map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        url: `https://${domain}/${page.slug}`,
      })),
    };
  } catch (error) {
    console.error('Failed to create tenant:', error);
    throw error;
  }
};

// Example usage:
/*
const newTenant = await createNewTenant(payload, {
  name: "City Health Clinic",
  domain: "cityhealthclinic.com",
  type: "healthcare",
  theme: {
    primaryColor: "#0077B6",
    secondaryColor: "#48CAE4",
    fontFamily: "inter",
  },
  features: {
    appointments: true,
    blog: true,
    team: true,
    services: true,
    testimonials: true,
  },
});

console.log('New tenant created:', newTenant);
// Output:
// {
//   success: true,
//   tenant: {
//     id: '123',
//     name: 'City Health Clinic',
//     domain: 'cityhealthclinic.com',
//     adminUrl: '/admin/tenants/123'
//   },
//   admin: {
//     email: 'admin+timestamp@cityhealthclinic.com',
//     username: 'admin_city-health-clinic',
//     loginUrl: '/admin/login'
//   },
//   pages: [
//     {
//       id: '456',
//       title: 'Home',
//       slug: 'home-123',
//       url: 'https://cityhealthclinic.com/home-123'
//     },
//     // ... other pages
//   ]
// }
*/
