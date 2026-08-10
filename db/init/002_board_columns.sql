-- Adds board data to databases created with the first version of the schema.
-- Docker runs this after 001_schema.sql on a new volume as well.
ALTER TABLE levels
  ADD COLUMN IF NOT EXISTS starting_board jsonb NOT NULL
    DEFAULT '{"rows": 20, "columns": 20, "cells": []}'::jsonb,
  ADD COLUMN IF NOT EXISTS target_board jsonb NOT NULL
    DEFAULT '{"rows": 20, "columns": 20, "cells": []}'::jsonb,
  ADD COLUMN IF NOT EXISTS starting_row integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS starting_column integer NOT NULL DEFAULT 0;

UPDATE levels
SET
  starting_board = '{"rows": 20, "columns": 20, "cells": []}'::jsonb,
  target_board = jsonb_build_object(
    'rows', 20,
    'columns', 20,
    'cells', CASE id
      WHEN 1 THEN jsonb_build_array(jsonb_build_object('row', 0, 'column', 0, 'color', '#000000'))
      WHEN 2 THEN jsonb_build_array(jsonb_build_object('row', 0, 'column', 0, 'color', '#ff0000'), jsonb_build_object('row', 0, 'column', 1, 'color', '#ff0000'))
      WHEN 3 THEN jsonb_build_array(jsonb_build_object('row', 0, 'column', 0, 'color', '#0000ff'), jsonb_build_object('row', 1, 'column', 0, 'color', '#0000ff'))
      ELSE jsonb_build_array()
    END
  ),
  starting_row = 0,
  starting_column = 0,
  is_published = id <= 3;

ALTER TABLE levels
  ADD CONSTRAINT levels_starting_row_check CHECK (starting_row BETWEEN 0 AND 19),
  ADD CONSTRAINT levels_starting_column_check CHECK (starting_column BETWEEN 0 AND 19),
  ADD CONSTRAINT levels_starting_board_shape_check CHECK (
    starting_board->>'rows' = '20'
    AND starting_board->>'columns' = '20'
    AND jsonb_typeof(starting_board->'cells') = 'array'
  ),
  ADD CONSTRAINT levels_target_board_shape_check CHECK (
    target_board->>'rows' = '20'
    AND target_board->>'columns' = '20'
    AND jsonb_typeof(target_board->'cells') = 'array'
  );
