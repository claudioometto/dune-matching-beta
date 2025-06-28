/*
  # Dune: Awakening - Deep Desert Alliance Database Schema

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `name` (string)
      - `nickname` (string)
      - `steam_id` (string, optional)
      - `game_level` (integer)
      - `equipment` (text array)
      - `tools` (text array)
      - `interests` (text array)
      - `desert_base` (boolean)
      - `created_at` (timestamp)

    - `group_ads`
      - `id` (uuid, primary key)
      - `host_id` (uuid, foreign key)
      - `title` (string)
      - `description` (text)
      - `resource_target` (text)
      - `roles_needed` (text array)
      - `max_members` (integer)
      - `status` (enum)
      - `created_at` (timestamp)

    - `group_matches`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key)
      - `player_id` (uuid, foreign key)
      - `status` (enum)
      - `joined_at` (timestamp, nullable)

    - `ratings`
      - `id` (uuid, primary key)
      - `from_player_id` (uuid, foreign key)
      - `to_player_id` (uuid, foreign key)
      - `group_id` (uuid, foreign key)
      - `stars` (integer 1-5)
      - `comment` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key constraints with CASCADE

  3. Indexes
    - Performance indexes on frequently queried columns
    - Composite indexes for complex queries
*/

-- Create custom types for enums
CREATE TYPE group_status AS ENUM ('open', 'in_progress', 'closed');
CREATE TYPE match_status AS ENUM ('invited', 'accepted', 'declined');

-- =====================================================
-- PLAYERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  nickname text NOT NULL UNIQUE,
  steam_id text,
  game_level integer NOT NULL CHECK (game_level >= 1 AND game_level <= 60),
  equipment text[] NOT NULL DEFAULT '{}',
  tools text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  desert_base boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players
CREATE POLICY "Players can read all profiles"
  ON players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert their own profile"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Players can update their own profile"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- =====================================================
-- GROUP_ADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS group_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  resource_target text,
  roles_needed text[] NOT NULL DEFAULT '{}',
  max_members integer NOT NULL DEFAULT 4 CHECK (max_members >= 2 AND max_members <= 8),
  status group_status NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE group_ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_ads
CREATE POLICY "Anyone can read open group ads"
  ON group_ads
  FOR SELECT
  TO authenticated
  USING (status = 'open' OR host_id = auth.uid());

CREATE POLICY "Players can create group ads"
  ON group_ads
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Host can update their group ads"
  ON group_ads
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Host can delete their group ads"
  ON group_ads
  FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- =====================================================
-- GROUP_MATCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS group_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES group_ads(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status match_status NOT NULL DEFAULT 'invited',
  joined_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure unique combination of group and player
  UNIQUE(group_id, player_id)
);

-- Enable RLS
ALTER TABLE group_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_matches
CREATE POLICY "Players can read their own matches"
  ON group_matches
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Group hosts can read matches for their groups"
  ON group_matches
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM group_ads WHERE host_id = auth.uid()
    )
  );

CREATE POLICY "System can create matches"
  ON group_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Players can update their match status"
  ON group_matches
  FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Group hosts can update matches for their groups"
  ON group_matches
  FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM group_ads WHERE host_id = auth.uid()
    )
  );

-- =====================================================
-- RATINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  to_player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES group_ads(id) ON DELETE CASCADE,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  
  -- Prevent self-rating and duplicate ratings
  CHECK (from_player_id != to_player_id),
  UNIQUE(from_player_id, to_player_id, group_id)
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "Players can read ratings about them"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (to_player_id = auth.uid());

CREATE POLICY "Players can read ratings they gave"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (from_player_id = auth.uid());

CREATE POLICY "Anyone can read ratings for reputation"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can create ratings"
  ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (from_player_id = auth.uid());

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Players indexes
CREATE INDEX IF NOT EXISTS idx_players_nickname ON players(nickname);
CREATE INDEX IF NOT EXISTS idx_players_game_level ON players(game_level);
CREATE INDEX IF NOT EXISTS idx_players_desert_base ON players(desert_base);
CREATE INDEX IF NOT EXISTS idx_players_interests ON players USING GIN(interests);

-- Group ads indexes
CREATE INDEX IF NOT EXISTS idx_group_ads_host_id ON group_ads(host_id);
CREATE INDEX IF NOT EXISTS idx_group_ads_status ON group_ads(status);
CREATE INDEX IF NOT EXISTS idx_group_ads_created_at ON group_ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_ads_resource_target ON group_ads(resource_target);

-- Group matches indexes
CREATE INDEX IF NOT EXISTS idx_group_matches_group_id ON group_matches(group_id);
CREATE INDEX IF NOT EXISTS idx_group_matches_player_id ON group_matches(player_id);
CREATE INDEX IF NOT EXISTS idx_group_matches_status ON group_matches(status);
CREATE INDEX IF NOT EXISTS idx_group_matches_joined_at ON group_matches(joined_at);

-- Ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_to_player_id ON ratings(to_player_id);
CREATE INDEX IF NOT EXISTS idx_ratings_from_player_id ON ratings(from_player_id);
CREATE INDEX IF NOT EXISTS idx_ratings_group_id ON ratings(group_id);
CREATE INDEX IF NOT EXISTS idx_ratings_stars ON ratings(stars);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_group_ads_status_created ON group_ads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_matches_group_status ON group_matches(group_id, status);
CREATE INDEX IF NOT EXISTS idx_ratings_player_stars ON ratings(to_player_id, stars);

-- =====================================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for player reputation summary
CREATE OR REPLACE VIEW player_reputation AS
SELECT 
  p.id,
  p.nickname,
  p.name,
  COALESCE(AVG(r.stars), 0) as average_rating,
  COUNT(r.id) as total_ratings,
  COUNT(CASE WHEN r.stars >= 4 THEN 1 END) as positive_ratings
FROM players p
LEFT JOIN ratings r ON p.id = r.to_player_id
GROUP BY p.id, p.nickname, p.name;

-- View for active group ads with host info
CREATE OR REPLACE VIEW active_groups AS
SELECT 
  ga.*,
  p.nickname as host_nickname,
  p.name as host_name,
  COUNT(gm.id) as current_members
FROM group_ads ga
JOIN players p ON ga.host_id = p.id
LEFT JOIN group_matches gm ON ga.id = gm.group_id AND gm.status = 'accepted'
WHERE ga.status = 'open'
GROUP BY ga.id, p.nickname, p.name;

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to automatically update group status when full
CREATE OR REPLACE FUNCTION update_group_status_when_full()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if group is now full
  IF (
    SELECT COUNT(*) 
    FROM group_matches 
    WHERE group_id = NEW.group_id AND status = 'accepted'
  ) >= (
    SELECT max_members 
    FROM group_ads 
    WHERE id = NEW.group_id
  ) THEN
    -- Update group status to in_progress
    UPDATE group_ads 
    SET status = 'in_progress' 
    WHERE id = NEW.group_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update group status
CREATE TRIGGER trigger_update_group_status
  AFTER UPDATE OF status ON group_matches
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION update_group_status_when_full();

-- Function to prevent rating after 30 days
CREATE OR REPLACE FUNCTION check_rating_time_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT created_at 
    FROM group_ads 
    WHERE id = NEW.group_id
  ) < NOW() - INTERVAL '30 days' THEN
    RAISE EXCEPTION 'Cannot rate players after 30 days from group creation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce rating time limit
CREATE TRIGGER trigger_rating_time_limit
  BEFORE INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION check_rating_time_limit();

-- =====================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- =====================================================

-- Insert sample players
INSERT INTO players (name, nickname, game_level, equipment, tools, interests, desert_base) VALUES
('João Silva', 'DesertWalker', 45, ARRAY['T4 - Tier 4', 'T3 - Tier 3', 'T4 - Tier 4'], ARRAY['T4 - Tier 4', 'T3 - Tier 3'], ARRAY['Coleta', 'PvP'], true),
('Maria Santos', 'SpiceHunter', 38, ARRAY['T3 - Tier 3', 'T3 - Tier 3', 'T3 - Tier 3'], ARRAY['T5 - Tier 5', 'T4 - Tier 4'], ARRAY['Coleta'], false),
('Pedro Costa', 'SandRider', 52, ARRAY['T5 - Tier 5', 'T4 - Tier 4', 'T5 - Tier 5'], ARRAY['T3 - Tier 3', 'T3 - Tier 3'], ARRAY['PvP'], true)
ON CONFLICT (nickname) DO NOTHING;

-- Insert sample group ads
INSERT INTO group_ads (host_id, title, description, resource_target, roles_needed, max_members) 
SELECT 
  p.id,
  'Expedição Noturna G5',
  'Farming de especiaria no setor G5 durante a madrugada',
  'Especiaria',
  ARRAY['Coleta', 'Ataque', 'Coleta', 'Ataque'],
  4
FROM players p 
WHERE p.nickname = 'DesertWalker'
ON CONFLICT DO NOTHING;