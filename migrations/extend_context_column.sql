-- If using PostgreSQL, you might need to modify the context column
ALTER TABLE twitter_interactions 
ALTER COLUMN context TYPE jsonb 
USING context::jsonb; 