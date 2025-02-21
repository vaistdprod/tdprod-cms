-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create base tables
CREATE TABLE IF NOT EXISTS public.migrations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  batch integer NOT NULL,
  executed_at timestamp with time zone DEFAULT timezone('utc', now())
);

CREATE TABLE public.tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  domain_verified BOOLEAN DEFAULT FALSE,
  domain_verification_details JSONB,
  features JSONB DEFAULT '{"blog": false, "team": true, "services": true, "testimonials": true, "appointments": false}',
  theme JSONB DEFAULT '{"primaryColor": "#007bff", "secondaryColor": "#6c757d", "fontFamily": "inter"}',
  layout JSONB,
  contact JSONB,
  seo JSONB,
  allow_public_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_tenant_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, tenant_id)
);

CREATE TABLE public.pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB,
  status TEXT DEFAULT 'draft',
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE public.media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  alt TEXT,
  url TEXT NOT NULL,
  mime_type TEXT,
  filesize INTEGER,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_pages_tenant ON public.pages(tenant_id);
CREATE INDEX idx_services_tenant ON public.services(tenant_id);
CREATE INDEX idx_team_tenant ON public.team_members(tenant_id);
CREATE INDEX idx_testimonials_tenant ON public.testimonials(tenant_id);
CREATE INDEX idx_faqs_tenant ON public.faqs(tenant_id);
CREATE INDEX idx_posts_tenant ON public.posts(tenant_id);
CREATE INDEX idx_media_tenant ON public.media(tenant_id);
CREATE INDEX idx_user_tenant_roles ON public.user_tenant_roles(user_id, tenant_id);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenant_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY tenant_isolation_policy ON public.pages
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
    ) OR 
    tenant_id IN (
      SELECT id FROM public.tenants WHERE allow_public_read = true
    )
  );

-- Repeat similar RLS policies for other tables
CREATE POLICY tenant_isolation_policy ON public.services USING (tenant_id IN (SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()) OR tenant_id IN (SELECT id FROM public.tenants WHERE allow_public_read = true));
CREATE POLICY tenant_isolation_policy ON public.team_members USING (tenant_id IN (SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()) OR tenant_id IN (SELECT id FROM public.tenants WHERE allow_public_read = true));
CREATE POLICY tenant_isolation_policy ON public.testimonials USING (tenant_id IN (SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()) OR tenant_id IN (SELECT id FROM public.tenants WHERE allow_public_read = true));
CREATE POLICY tenant_isolation_policy ON public.faqs USING (tenant_id IN (SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()) OR tenant_id IN (SELECT id FROM public.tenants WHERE allow_public_read = true));
CREATE POLICY tenant_isolation_policy ON public.posts USING (tenant_id IN (SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()) OR tenant_id IN (SELECT id FROM public.tenants WHERE allow_public_read = true));
CREATE POLICY tenant_isolation_policy ON public.media USING (tenant_id IN (SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()) OR tenant_id IN (SELECT id FROM public.tenants WHERE allow_public_read = true));

CREATE POLICY tenant_roles_isolation_policy ON public.user_tenant_roles
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_tenant_roles utr
      WHERE utr.user_id = auth.uid()
      AND utr.tenant_id = user_tenant_roles.tenant_id
      AND 'admin' = ANY(utr.roles)
    )
  ); 