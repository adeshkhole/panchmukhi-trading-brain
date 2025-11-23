-- Panchmukhi Trading Brain Pro - PostgreSQL Initialization Script
-- Creates the required user and database for the backend application

-- Create the trading app user (must be different from postgres root user)
-- Only if it doesn't exist
DO $$ BEGIN
    CREATE USER panchmukhi_user WITH PASSWORD 'panchmukhi_pass123';
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Note: Database is already created via POSTGRES_DB environment variable
-- This script just sets up user permissions and roles

-- Connect to the panchmukhi_trading database and grant privileges
\connect panchmukhi_trading

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE panchmukhi_trading TO panchmukhi_user;

-- Grant schema privileges (for public schema and future schemas)
GRANT ALL PRIVILEGES ON SCHEMA public TO panchmukhi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO panchmukhi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO panchmukhi_user;

-- Optional: Create additional application roles for fine-grained access control
DO $$ BEGIN
    CREATE ROLE panchmukhi_readonly;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

GRANT CONNECT ON DATABASE panchmukhi_trading TO panchmukhi_readonly;
GRANT USAGE ON SCHEMA public TO panchmukhi_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO panchmukhi_readonly;

-- Log successful initialization
\echo 'PostgreSQL initialization completed successfully for Panchmukhi Trading Brain Pro'
