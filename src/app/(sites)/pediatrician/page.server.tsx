import { getPayload } from '../../../utilities/getPayload';
import PediatricianPage from './page';

interface Service {
  title: string;
  description: string;
  icon: string;
}

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image?: {
    url: string;
  };
}

async function getData() {
  const payload = await getPayload();

  // First get the tenant ID
  const tenant = await payload.find({
    collection: 'tenants',
    where: {
      slug: {
        equals: 'pediatric-clinic'
      }
    }
  });

  if (!tenant.docs.length) {
    throw new Error('Tenant not found');
  }

  const tenantId = tenant.docs[0].id;

  const [services, team] = await Promise.all([
    payload.find({
      collection: 'services',
      where: {
        associatedTenant: {
          equals: tenantId
        }
      },
      sort: 'order',
    }),
    payload.find({
      collection: 'team',
      where: {
        associatedTenant: {
          equals: tenantId
        }
      },
      sort: 'order',
    }),
  ]);

  return {
    services: services.docs.filter((service: Service) => !service.title.includes('Insurance') && !service.title.includes('Testimonial')),
    team: team.docs,
    insurance: services.docs.filter((service: Service) => service.title.includes('Insurance')),
    testimonials: services.docs.filter((service: Service) => service.title.includes('Testimonial')).map((testimonial: Service) => ({
      patientName: testimonial.title.replace('Parent Testimonial - ', ''),
      testimonial: testimonial.description,
      rating: 5,
      date: new Date().toISOString()
    })),
  };
}

export default async function Page() {
  const data = await getData();
  return <PediatricianPage {...data} />;
}
