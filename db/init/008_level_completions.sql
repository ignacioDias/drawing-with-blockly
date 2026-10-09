-- Records which user completed which level, and how many points were awarded.
-- A level can only award points once per user (primary key), so solving it again
-- records nothing new.
CREATE TABLE IF NOT EXISTS level_completions (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id integer NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  points_awarded integer NOT NULL CHECK (points_awarded >= 0),
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, level_id)
);

CREATE INDEX IF NOT EXISTS level_completions_user_idx
  ON level_completions (user_id);
