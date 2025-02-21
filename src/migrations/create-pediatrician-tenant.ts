import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

type LanguageLevel = 'native' | 'fluent' | 'professional' | 'basic';

interface TeamMember {
  name: string;
  role: string;
  specialization: string;
  bio: string;
  order: number;
  associatedTenant: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
    year: string;
  }>;
  languages: Array<{
    language: string;
    level: LanguageLevel;
  }>;
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    // Create the tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Pediatric Clinic',
        domain: 'pediatric.localhost',
        slug: 'pediatric-clinic',
        allowPublicRead: true,
        businessType: 'healthcare',
        features: {
          blog: true,
          team: true,
          services: true,
          testimonials: true,
          appointments: true,
        },
        theme: {
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          fontFamily: 'montserrat',
        },
        contact: {
          email: 'info@pediatric.localhost',
          phone: '(555) 123-4567',
          address: '123 Medical Center Drive\nSuite 100\nAnytown, USA 12345',
          socialMedia: [
            {
              platform: 'facebook',
              url: 'https://facebook.com/pediatricclinic',
            },
            {
              platform: 'instagram',
              url: 'https://instagram.com/pediatricclinic',
            },
          ],
        },
      },
      overrideAccess: true
    });

    // Find super admin user
    const existingSuperAdmin = await payload.find({
      collection: 'users',
      where: {
        roles: {
          contains: 'super-admin',
        },
      },
    });

    if (existingSuperAdmin.docs.length > 0) {
      const superAdmin = existingSuperAdmin.docs[0];
      // Update super admin with tenant access
      await payload.update({
        collection: 'users',
        id: superAdmin.id,
        data: {
          tenants: [
            ...(superAdmin.tenants || []),
            {
              roles: ['tenant-admin'],
              tenant: tenant.id,
            },
          ],
        },
        overrideAccess: true
      });
    }

    // Create tenant admin user if it doesn't exist
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@pediatric.localhost',
        },
      },
    });

    if (existingUser.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@pediatric.localhost',
          password: 'changeme123', // Should be changed on first login
          tenants: [
            {
              roles: ['tenant-admin'],
              tenant: tenant.id,
            },
          ],
          username: 'admin_pediatric',
        },
        overrideAccess: true,
      });
    }

    // Create initial services
    const services = [
      {
        title: 'General Pediatric Care',
        description: 'Comprehensive health care services for children from birth through adolescence.',
        icon: '🏥',
        order: 1,
        associatedTenant: tenant.id,
      },
      {
        title: 'Vaccinations',
        description: 'Complete immunization services following the recommended vaccination schedule.',
        icon: '💉',
        order: 2,
        associatedTenant: tenant.id,
      },
      {
        title: 'Development Monitoring',
        description: 'Regular assessment of your child\'s growth, development, and milestones.',
        icon: '📈',
        order: 3,
        associatedTenant: tenant.id,
      },
    ];

    for (const service of services) {
      await payload.create({
        collection: 'services',
        data: service,
        overrideAccess: true,
      });
    }

    // Create initial team members
    const teamMembers: TeamMember[] = [
      {
        name: 'Dr. Sarah Johnson',
        role: 'Lead Pediatrician',
        specialization: 'General Pediatrics',
        bio: 'Board-certified pediatrician with 15 years of experience.',
        order: 1,
        associatedTenant: tenant.id,
        education: [
          {
            degree: 'M.D.',
            institution: 'Harvard Medical School',
            year: '2008',
          },
        ],
        certifications: [
          {
            title: 'Board Certification in Pediatrics',
            issuer: 'American Board of Pediatrics',
            year: '2010',
          },
        ],
        languages: [
          {
            language: 'English',
            level: 'native',
          },
        ],
      },
      {
        name: 'Dr. Michael Chen',
        role: 'Pediatric Specialist',
        specialization: 'Respiratory Conditions',
        bio: 'Specializing in pediatric respiratory conditions.',
        order: 2,
        associatedTenant: tenant.id,
        education: [
          {
            degree: 'M.D.',
            institution: 'Stanford University School of Medicine',
            year: '2010',
          },
        ],
        certifications: [
          {
            title: 'Board Certification in Pediatric Pulmonology',
            issuer: 'American Board of Pediatrics',
            year: '2012',
          },
        ],
        languages: [
          {
            language: 'English',
            level: 'fluent',
          },
          {
            language: 'Mandarin',
            level: 'native',
          },
        ],
      },
      {
        name: 'Nurse Emily Wilson',
        role: 'Head Nurse',
        specialization: 'Pediatric Nursing',
        bio: 'Dedicated pediatric nurse with extensive experience.',
        order: 3,
        associatedTenant: tenant.id,
        education: [
          {
            degree: 'BSN',
            institution: 'Johns Hopkins School of Nursing',
            year: '2012',
          },
        ],
        certifications: [
          {
            title: 'Certified Pediatric Nurse',
            issuer: 'Pediatric Nursing Certification Board',
            year: '2014',
          },
        ],
        languages: [
          {
            language: 'English',
            level: 'native',
          },
          {
            language: 'Spanish',
            level: 'professional',
          },
        ],
      },
    ];

    for (const member of teamMembers) {
      await payload.create({
        collection: 'team',
        data: {
          ...member,
          // We'll need to add images through the admin interface
          image: '64e3c2d0f067c1dd6f000000', // Placeholder ID that will need to be updated
        },
        overrideAccess: true,
      });
    }

    // Create initial testimonials
    const testimonials = [
      {
        author: 'Jane Smith',
        role: 'Parent',
        content: 'Excellent care and attention to detail. Dr. Johnson is amazing with kids!',
        rating: "5" as const,
        associatedTenant: tenant.id,
        status: 'published',
      },
      {
        author: 'Mike Brown',
        role: 'Parent',
        content: 'Very professional staff and clean facility. My children love coming here.',
        rating: "5" as const,
        associatedTenant: tenant.id,
        status: 'published',
      },
      {
        author: 'Sarah Wilson',
        role: 'Parent',
        content: 'The best pediatric care in the area. Highly recommended!',
        rating: "5" as const,
        associatedTenant: tenant.id,
        status: 'published',
      },
    ];

    for (const testimonial of testimonials) {
      await payload.create({
        collection: 'testimonials',
        data: testimonial,
        overrideAccess: true,
      });
    }

    // Create initial FAQ entries
    const faqs = [
      {
        question: 'What ages do you treat?',
        answer: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ text: 'We provide care for children from birth through adolescence (18 years old).' }],
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: 'General',
        associatedTenant: tenant.id,
        order: 1,
      },
      {
        question: 'Do you accept insurance?',
        answer: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ text: 'Yes, we accept most major insurance plans including Blue Cross, Aetna, UnitedHealthcare, and Cigna. Please contact our office to verify your specific coverage.' }],
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: 'Insurance & Billing',
        associatedTenant: tenant.id,
        order: 2,
      },
      {
        question: 'How do I schedule an appointment?',
        answer: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [{ text: 'You can schedule an appointment by calling our office during business hours, using our online booking system, or filling out the appointment request form on our website.' }],
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
          },
        },
        category: 'Appointments',
        associatedTenant: tenant.id,
        order: 3,
      },
    ];

    for (const faq of faqs) {
      await payload.create({
        collection: 'faqs',
        data: faq,
        overrideAccess: true,
      });
    }

    // Create the page
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Pediatric Clinic',
        slug: 'pediatric-clinic',
        uniqueSlug: 'pediatric-clinic',
        associatedTenant: tenant.id,
        layout: [
          {
            blockType: 'hero',
            heading: 'Caring for Your Children\'s Health',
            subheading: 'Providing comprehensive pediatric care with a gentle touch and years of expertise.',
            buttons: [
              {
                label: 'Book Appointment',
                link: '#contact',
                style: 'primary',
              },
            ],
            style: {
              textAlignment: 'center',
              height: 'auto',
              padding: {
                top: '4rem',
                bottom: '4rem',
              },
            },
          },
          {
            blockType: 'textContent',
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'h1',
                    version: 1,
                    children: [{ text: 'Welcome to Our Pediatric Clinic' }],
                  },
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [{ text: 'We are dedicated to providing the highest quality healthcare for your children. Our team of experienced pediatricians and nurses is committed to making every visit comfortable and reassuring for both children and parents.' }],
                  },
                  {
                    type: 'h2',
                    version: 1,
                    children: [{ text: 'Our Mission' }],
                  },
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [{ text: 'To deliver exceptional pediatric care in a warm, welcoming environment where children feel safe and parents feel confident in their children\'s healthcare.' }],
                  },
                ],
            direction: 'ltr' as const,
            format: '' as const,
                indent: 0,
                version: 1,
              },
            },
            columns: '1',
            style: {
              alignment: 'left',
              padding: {
                top: '2rem',
                bottom: '2rem',
              },
            },
          },
        ],
      },
      overrideAccess: true,
    });

    console.log('Successfully created pediatrician tenant and initial data');
  } catch (error) {
    console.error('Error creating pediatrician tenant:', error);
    throw error;
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  try {
    // Find and delete the tenant
    const tenantResult = await payload.find({
      collection: 'tenants',
      where: {
        slug: {
          equals: 'pediatric-clinic',
        },
      },
    });

    const tenants = tenantResult as unknown as { docs: Array<{ id: string }> };

    if (tenants.docs.length > 0) {
      const tenantId = tenants.docs[0].id;
      // Delete all associated data
      await Promise.all([
        payload.delete({
          collection: 'tenants',
          id: tenantId,
        }),
        payload.delete({
          collection: 'pages',
          where: {
            associatedTenant: {
              equals: tenantId,
            },
          },
        }),
        payload.delete({
          collection: 'services',
          where: {
            associatedTenant: {
              equals: tenantId,
            },
          },
        }),
        payload.delete({
          collection: 'team',
          where: {
            associatedTenant: {
              equals: tenantId,
            },
          },
        }),
        payload.delete({
          collection: 'testimonials',
          where: {
            associatedTenant: {
              equals: tenantId,
            },
          },
        }),
        payload.delete({
          collection: 'faqs',
          where: {
            associatedTenant: {
              equals: tenantId,
            },
          },
        }),
      ]);

      // Delete tenant admin user
      await payload.delete({
        collection: 'users',
        where: {
          username: {
            equals: 'admin_pediatric',
          },
        },
      });
    }

    console.log('Successfully removed pediatrician tenant and associated data');
  } catch (error) {
    console.error('Error removing pediatrician tenant:', error);
    throw error;
  }
}
