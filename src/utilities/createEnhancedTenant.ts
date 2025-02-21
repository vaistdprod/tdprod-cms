import { Payload } from 'payload';
import { getBusinessTemplate } from '../templates/tenantTemplates';
import { baseTemplate } from '../templates/enhanced/base/baseTemplate';
import { healthcareTemplate } from '../templates/enhanced/healthcare/healthcareTemplate';
import { componentLoader } from '../components/enhanced/ComponentLoader';
import { ComponentInstance } from '../components/enhanced/types';
import { Block } from '../templates/enhanced/types';
import {
  PayloadBlock,
  CollectionDataMap,
  TenantType,
  FontFamily,
  TenantRole,
  HeroBlock,
  ServiceGridBlock,
  TextContentBlock,
  CollectionSlug,
  PublishStatus,
} from './types';

type CreateDataType<T extends CollectionSlug> = Omit<CollectionDataMap[T], 'id' | 'createdAt' | 'updatedAt' | 'sizes'> & {
  status: PublishStatus;
};

interface CreateTenantOptions {
  name: string;
  slug: string;
  domain: string;
  type: TenantType;
  features?: {
    blog?: boolean;
    team?: boolean;
    services?: boolean;
    testimonials?: boolean;
    appointments?: boolean;
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: FontFamily;
  };
}

interface BlockToComponentMap {
  [key: string]: {
    componentId: string;
    propsMap: (block: Block) => Record<string, any>;
  };
}

const blockToComponentMap: BlockToComponentMap = {
  hero: {
    componentId: 'hero',
    propsMap: (block) => ({
      heading: block.heading,
      subheading: block.subheading,
      backgroundImage: block.backgroundImage,
      ctaButton: block.ctaButton,
      style: block.style,
    }),
  },
  serviceGrid: {
    componentId: 'service-grid',
    propsMap: (block) => ({
      heading: block.heading,
      description: block.description,
      services: block.services,
      style: block.style,
    }),
  },
  // Add mappings for other block types
};

const convertBlockToComponent = (block: Block): ComponentInstance => {
  const mapping = blockToComponentMap[block.blockType];
  if (!mapping) {
    throw new Error(`No component mapping found for block type: ${block.blockType}`);
  }

  return {
    componentId: mapping.componentId,
    props: mapping.propsMap(block),
  };
};

const convertComponentToPayloadBlock = (component: ComponentInstance): PayloadBlock => {
  switch (component.componentId) {
    case 'hero':
      return {
        blockType: 'hero',
        heading: component.props.heading,
        subheading: component.props.subheading,
        formType: component.props.formType,
        style: component.props.style,
      } as HeroBlock;
    case 'service-grid':
      return {
        blockType: 'serviceGrid',
        heading: component.props.heading,
        description: component.props.description,
        services: component.props.services,
        style: component.props.style,
      } as ServiceGridBlock;
    case 'text-content':
      return {
        blockType: 'textContent',
        content: component.props.content,
      } as TextContentBlock;
    default:
      throw new Error(`No block type mapping found for component: ${component.componentId}`);
  }
};

const createCollectionItem = async <T extends CollectionSlug>(
  payload: Payload,
  collection: T,
  data: CreateDataType<T>
) => {
  return payload.create({
    collection,
    data: data as any, // Type assertion needed due to Payload's types
    overrideAccess: true,
  });
};

export const createEnhancedTenant = async (
  payload: Payload,
  options: CreateTenantOptions
) => {
  const { name, slug, domain, type, features, theme } = options;
  const timestamp = Date.now();

  // Load appropriate template based on type
  let template;
  switch (type) {
    case 'healthcare':
      template = healthcareTemplate;
      break;
    // Add more template types as they're created
    default:
      template = baseTemplate;
  }

  try {
    // Load components for the template
    await componentLoader.loadComponentsForTemplate(type);

    // Create the tenant
    const tenantData: CreateDataType<'tenants'> = {
      name,
      slug,
      domain,
      businessType: type,
      features: {
        blog: features?.blog ?? template.features.blog,
        team: features?.team ?? template.features.team,
        services: features?.services ?? template.features.services,
        testimonials: features?.testimonials ?? template.features.testimonials,
        appointments: features?.appointments ?? template.features.appointments,
      },
      theme: {
        primaryColor: theme?.primaryColor || template.theme.colors.primary,
        secondaryColor: theme?.secondaryColor || template.theme.colors.secondary,
        fontFamily: (theme?.fontFamily || template.theme.typography.fontFamily) as FontFamily,
      },
      allowPublicRead: true,
      contact: {
        email: `contact@${domain}`,
      },
      status: 'published',
    };

    const tenant = await createCollectionItem(payload, 'tenants', tenantData);

    // Create tenant admin user
    const userData: CreateDataType<'users'> = {
      email: `admin+${timestamp}@${domain}`,
      password: 'changeme123', // Should be changed on first login
      tenants: [
        {
          roles: ['tenant-admin' as TenantRole],
          tenant: tenant.id,
        },
      ],
      username: `admin_${slug}`,
      status: 'published',
    };

    const adminUser = await createCollectionItem(payload, 'users', userData);

    // Create default pages with components
    const pages = await Promise.all(
      template.defaultPages.map(async (page) => {
        const uniqueSlug = `${page.slug}-${tenant.id}`;
        
        // Convert layout blocks to Payload blocks
        const layoutBlocks = page.layout.map((block: Block) => {
          const componentInstance = convertBlockToComponent(block);
          // Replace placeholders in component props
          Object.keys(componentInstance.props).forEach(key => {
            if (typeof componentInstance.props[key] === 'string') {
              componentInstance.props[key] = componentInstance.props[key].replace(/\[.*?\]/g, name);
            }
          });
          // Convert to Payload block format
          return convertComponentToPayloadBlock(componentInstance);
        });

        const pageData: CreateDataType<'pages'> = {
          title: page.title.replace(/\[.*?\]/g, name),
          slug: uniqueSlug,
          uniqueSlug,
          associatedTenant: tenant.id,
          layout: layoutBlocks,
          status: 'published',
        };

        return createCollectionItem(payload, 'pages', pageData);
      })
    );

    // Create default collection items
    const collections = await Promise.all(
      Object.entries(template.defaultCollections).map(async ([collectionSlug, items]) => {
        if (!items?.length) return null;

        return Promise.all(
          items.map(async (item) => {
            const baseData = {
              ...item,
              associatedTenant: tenant.id,
              status: 'published' as const,
              // Replace placeholders in strings with tenant name
              ...(Object.entries(item).reduce((acc, [key, value]) => {
                if (typeof value === 'string') {
                  acc[key] = value.replace(/\[.*?\]/g, name);
                }
                return acc;
              }, {} as Record<string, any>)),
            };

            return createCollectionItem(
              payload,
              collectionSlug as CollectionSlug,
              baseData as CreateDataType<CollectionSlug>
            );
          })
        );
      })
    );

    return {
      tenant,
      adminUser,
      pages,
      collections,
    };
  } catch (error) {
    console.error('Error creating enhanced tenant:', error);
    throw error;
  }
};
