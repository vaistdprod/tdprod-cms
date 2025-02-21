-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.media;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.faqs;
DROP TABLE IF EXISTS public.testimonials;
DROP TABLE IF EXISTS public.team_members;
DROP TABLE IF EXISTS public.services;
DROP TABLE IF EXISTS public.pages;
DROP TABLE IF EXISTS public.user_tenant_roles;
DROP TABLE IF EXISTS public.tenants;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table
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

-- Create user_tenant_roles table
CREATE TABLE public.user_tenant_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    roles TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, tenant_id)
);

-- Create pages table
CREATE TABLE public.pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    unique_slug TEXT NOT NULL UNIQUE,
    layout JSONB,
    seo JSONB,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tenant_id, slug)
);

-- Create services table
CREATE TABLE public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    specialization TEXT,
    bio TEXT,
    image_url TEXT,
    order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create faqs table
CREATE TABLE public.faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table
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

-- Create media table
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

-- Enable RLS
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

CREATE POLICY tenant_isolation_policy ON public.services
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
        ) OR 
        tenant_id IN (
            SELECT id FROM public.tenants WHERE allow_public_read = true
        )
    );

CREATE POLICY tenant_isolation_policy ON public.team_members
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
        ) OR 
        tenant_id IN (
            SELECT id FROM public.tenants WHERE allow_public_read = true
        )
    );

CREATE POLICY tenant_isolation_policy ON public.testimonials
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
        ) OR 
        tenant_id IN (
            SELECT id FROM public.tenants WHERE allow_public_read = true
        )
    );

CREATE POLICY tenant_isolation_policy ON public.faqs
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
        ) OR 
        tenant_id IN (
            SELECT id FROM public.tenants WHERE allow_public_read = true
        )
    );

CREATE POLICY tenant_isolation_policy ON public.posts
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
        ) OR 
        tenant_id IN (
            SELECT id FROM public.tenants WHERE allow_public_read = true
        )
    );

CREATE POLICY tenant_isolation_policy ON public.media
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
        ) OR 
        tenant_id IN (
            SELECT id FROM public.tenants WHERE allow_public_read = true
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON public.media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
