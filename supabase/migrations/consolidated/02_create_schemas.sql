CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS private;

GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA private TO authenticated;