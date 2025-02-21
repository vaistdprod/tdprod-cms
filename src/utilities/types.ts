export type TenantType = 'healthcare' | 'legal' | 'education' | 'professional' | 'non-profit' | 'other';
export type TenantRole = 'tenant-admin' | 'tenant-viewer';
export type FontFamily = 'inter' | 'montserrat' | 'roboto' | 'open-sans';
export type PublishStatus = 'draft' | 'published';

export interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT' | 'MX' | 'NS';
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
}

export interface BaseFields {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  sizes?: any;
  status?: PublishStatus;
}

export interface HeroBlock {
  blockType: 'hero';
  heading: string;
  subheading?: string | null;
  formType?: 'contact' | 'appointment' | null;
  style?: {
    layout?: 'split' | 'centered' | 'full' | null;
    textAlignment?: 'left' | 'center' | 'right';
    padding?: Record<string, string | number>;
    background?: 'white' | 'light' | 'dark' | 'primary';
  };
}

export interface ServiceGridBlock {
  blockType: 'serviceGrid';
  heading: string;
  description?: string;
  services: any[];
  style?: Record<string, any>;
}

export interface TextContentBlock {
  blockType: 'textContent';
  content: {
    root: {
      type: string;
      children: Array<{
        type: string;
        version: number;
        [key: string]: unknown;
      }>;
      direction: 'ltr' | 'rtl' | null;
      format: '' | 'left' | 'center' | 'right' | 'start' | 'end' | 'justify';
      indent: number;
      version: number;
    };
  };
}

export type PayloadBlock = HeroBlock | ServiceGridBlock | TextContentBlock;

export interface TenantData extends BaseFields {
  name: string;
  slug: string;
  domain: string;
  businessType: TenantType;
  features: {
    blog: boolean;
    team: boolean;
    services: boolean;
    testimonials: boolean;
    appointments: boolean;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: FontFamily | null;
  };
  allowPublicRead: boolean;
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface UserData extends BaseFields {
  email: string;
  username: string;
  password?: string;
  tenants: Array<{
    roles: TenantRole[];
    tenant: string;
    id?: string | null;
  }>;
}

export interface PageData extends BaseFields {
  title: string;
  slug: string;
  uniqueSlug: string;
  associatedTenant: string;
  layout: PayloadBlock[];
  meta?: {
    title?: string;
    description?: string;
  };
  breadcrumbs?: string[];
  parent?: string | null;
}

export interface ServiceData extends BaseFields {
  title: string;
  description: string;
  slug: string;
  category?: string;
  price?: number;
  duration?: number;
  associatedTenant: string;
  meta?: {
    title?: string;
    description?: string;
  };
}

export interface TeamMemberData extends BaseFields {
  name: string;
  role: string;
  slug: string;
  bio?: string;
  image?: string;
  associatedTenant: string;
  specialties?: string[];
  contact?: {
    email?: string;
    phone?: string;
  };
}

export interface TestimonialData extends BaseFields {
  author: string;
  content: string;
  rating?: number;
  associatedTenant: string;
  date?: string;
  verified?: boolean;
}

export interface PostData extends BaseFields {
  title: string;
  slug: string;
  content: any;
  author: string;
  associatedTenant: string;
  publishedDate?: string;
  categories?: string[];
  tags?: string[];
  meta?: {
    title?: string;
    description?: string;
  };
  featuredImage?: string;
}

export interface MediaData extends BaseFields {
  alt?: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  url: string;
  associatedTenant?: string;
}

export type CollectionSlug = 'pages' | 'media' | 'users' | 'tenants' | 'services' | 'team' | 'testimonials' | 'posts';

export type CollectionDataMap = {
  pages: PageData;
  media: MediaData;
  users: UserData;
  tenants: TenantData;
  services: ServiceData;
  team: TeamMemberData;
  testimonials: TestimonialData;
  posts: PostData;
};

export type PayloadCreateData<T extends BaseFields> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'sizes'> & {
  status: PublishStatus;
};

export type PayloadCollection = {
  slug: string;
  fields: any[];
  [key: string]: any;
};

export type CollectionItemData<T extends CollectionSlug> = PayloadCreateData<CollectionDataMap[T]> & {
  associatedTenant?: string;
};
