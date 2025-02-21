-- Create versions table for document versioning
CREATE TABLE IF NOT EXISTS public.versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection TEXT NOT NULL,
    document_id UUID NOT NULL,
    version JSONB NOT NULL,
    latest BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create globals_versions table for global versioning
CREATE TABLE IF NOT EXISTS public.globals_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection TEXT NOT NULL,
    version JSONB NOT NULL,
    latest BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create migrations table to track executed migrations
CREATE TABLE IF NOT EXISTS public.migrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_versions_collection ON public.versions(collection);
CREATE INDEX idx_versions_document_id ON public.versions(document_id);
CREATE INDEX idx_versions_latest ON public.versions(latest);
CREATE INDEX idx_globals_versions_collection ON public.globals_versions(collection);
CREATE INDEX idx_globals_versions_latest ON public.globals_versions(latest);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_versions_updated_at
    BEFORE UPDATE ON public.versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_globals_versions_updated_at
    BEFORE UPDATE ON public.globals_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to create globals table if it doesn't exist
CREATE OR REPLACE FUNCTION create_globals_if_not_exists()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS public.globals (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create trigger for updated_at if table was just created
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'update_globals_updated_at'
    ) THEN
        CREATE TRIGGER update_globals_updated_at
            BEFORE UPDATE ON public.globals
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$ LANGUAGE plpgsql;
