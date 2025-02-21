-- Create globals table
CREATE TABLE IF NOT EXISTS public.globals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create version tables for content types that need versioning
CREATE TABLE IF NOT EXISTS public.pages_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB,
    status TEXT DEFAULT 'draft',
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create version number sequences
CREATE SEQUENCE IF NOT EXISTS public.pages_version_seq;
CREATE SEQUENCE IF NOT EXISTS public.posts_version_seq;

-- Create indexes for version tables
CREATE INDEX idx_pages_versions_parent ON public.pages_versions(parent_id);
CREATE INDEX idx_pages_versions_tenant ON public.pages_versions(tenant_id);
CREATE INDEX idx_posts_versions_parent ON public.posts_versions(parent_id);
CREATE INDEX idx_posts_versions_tenant ON public.posts_versions(tenant_id);

-- Enable RLS on version tables
ALTER TABLE public.pages_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.globals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for version tables
CREATE POLICY tenant_isolation_policy ON public.pages_versions
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
        ) OR 
        tenant_id IN (
            SELECT id FROM public.tenants WHERE allow_public_read = true
        )
    );

CREATE POLICY tenant_isolation_policy ON public.posts_versions
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.user_tenant_roles WHERE user_id = auth.uid()
        ) OR 
        tenant_id IN (
            SELECT id FROM public.tenants WHERE allow_public_read = true
        )
    );

CREATE POLICY globals_access_policy ON public.globals
    FOR ALL USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_updated_at_timestamp ON %I;
            CREATE TRIGGER update_updated_at_timestamp
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create transaction handler function
CREATE OR REPLACE FUNCTION public.transaction_handler(
    operations jsonb[]
)
RETURNS jsonb[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    op jsonb;
    result jsonb;
    results jsonb[] := '{}';
    collection text;
    operation text;
    data jsonb;
    record_id uuid;
    where_clause jsonb;
BEGIN
    -- Process each operation in sequence
    FOR op IN SELECT * FROM jsonb_array_elements(operations)
    LOOP
        collection := op->>'collection';
        operation := op->>'type';
        data := op->'data';
        record_id := (op->>'id')::uuid;
        where_clause := op->'where';
        
        -- Execute operation based on type
        CASE operation
            WHEN 'create' THEN
                EXECUTE format(
                    'INSERT INTO %I (data) VALUES ($1) RETURNING to_jsonb(*)',
                    collection
                ) USING data INTO result;
                
            WHEN 'update' THEN
                IF record_id IS NOT NULL THEN
                    EXECUTE format(
                        'UPDATE %I SET data = $1 WHERE id = $2 RETURNING to_jsonb(*)',
                        collection
                    ) USING data, record_id INTO result;
                ELSE
                    -- Handle where clause update
                    EXECUTE format(
                        'UPDATE %I SET data = $1 WHERE data @> $2 RETURNING to_jsonb(*)',
                        collection
                    ) USING data, where_clause INTO result;
                END IF;
                
            WHEN 'delete' THEN
                IF record_id IS NOT NULL THEN
                    EXECUTE format(
                        'DELETE FROM %I WHERE id = $1 RETURNING to_jsonb(*)',
                        collection
                    ) USING record_id INTO result;
                ELSE
                    -- Handle where clause delete
                    EXECUTE format(
                        'DELETE FROM %I WHERE data @> $1 RETURNING to_jsonb(*)',
                        collection
                    ) USING where_clause INTO result;
                END IF;
        END CASE;
        
        -- Store operation result
        results := array_append(results, result);
    END LOOP;
    
    RETURN results;
END;
$$;

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_pages_updated ON public.pages(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_updated ON public.posts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_filename ON public.media USING gin (filename gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pages_title ON public.pages USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_title ON public.posts USING gin (title gin_trgm_ops);
