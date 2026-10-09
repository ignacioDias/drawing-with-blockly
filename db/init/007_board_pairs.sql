-- A level may define several (starting board, target board) pairs.
-- Each starting board is linked to exactly one target board, and the system
-- randomly picks a single pair when the level is solved.
ALTER TABLE levels
  ADD COLUMN IF NOT EXISTS board_pairs jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill existing levels with a single pair built from their legacy
-- starting_board / target_board columns.
UPDATE levels
SET board_pairs = jsonb_build_array(
  jsonb_build_object(
    'starting_board', starting_board,
    'target_board', target_board
  )
)
WHERE board_pairs = '[]'::jsonb;
