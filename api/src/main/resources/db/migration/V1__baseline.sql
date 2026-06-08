-- Baseline migration: an empty starting point.
-- Future migrations will add tables for users, games, and history.

-- Ensure the gen_random_uuid() function is available for UUID primary keys.
CREATE EXTENSION IF NOT EXISTS pgcrypto;