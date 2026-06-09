-- Users table
CREATE TABLE users (
                       id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       auth0_id     TEXT NOT NULL UNIQUE,
                       display_name TEXT NOT NULL,
                       created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_auth0_id ON users(auth0_id);

-- Games table — at most one active game per user
CREATE TABLE games (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                       difficulty  TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
                       puzzle      JSONB NOT NULL,
                       entries     JSONB NOT NULL,
                       notes       JSONB NOT NULL,
                       solution    JSONB NOT NULL,
                       elapsed_ms  BIGINT NOT NULL DEFAULT 0,
                       started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- History — completed games, append-only
CREATE TABLE history_entries (
                                 id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                 difficulty   TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
                                 elapsed_ms   BIGINT NOT NULL,
                                 completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_history_user_difficulty ON history_entries(user_id, difficulty);
CREATE INDEX idx_history_user_completed ON history_entries(user_id, completed_at DESC);