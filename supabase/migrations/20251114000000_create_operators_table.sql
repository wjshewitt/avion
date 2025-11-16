-- Operators master table for charter companies
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  region TEXT,
  country_code TEXT,
  iata_code TEXT,
  icao_code TEXT,
  logo_url TEXT,
  logo_cached_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_operators_name ON operators(name);
CREATE INDEX IF NOT EXISTS idx_operators_domain ON operators(domain);
CREATE INDEX IF NOT EXISTS idx_operators_active ON operators(active) WHERE active = true;

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_operators_updated_at ON operators;
CREATE TRIGGER update_operators_updated_at
  BEFORE UPDATE ON operators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial European operators with domain mappings
INSERT INTO operators (name, domain, region, country_code) VALUES
  ('NetJets Europe', 'netjets.com', 'Pan-European', 'EU'),
  ('VistaJet', 'vistajet.com', 'Malta', 'MT'),
  ('Luxaviation', 'luxaviation.com', 'Luxembourg', 'LU'),
  ('Air Hamburg', 'airhamburg.de', 'Germany', 'DE'),
  ('GlobeAir', 'globeair.com', 'Austria', 'AT'),
  ('ExecuJet Europe', 'execujet.com', 'Switzerland', 'CH'),
  ('TAG Aviation', 'tagaviation.com', 'Switzerland', 'CH'),
  ('Flexjet', 'flexjet.com', 'UK', 'GB'),
  ('Jetfly', 'jetfly.com', 'Belgium', 'BE'),
  ('Elit''Avia', 'elitavia.fr', 'France', 'FR'),
  ('Comlux', 'comlux.com', 'Switzerland', 'CH'),
  ('London Executive Aviation', 'londonexecutiveaviation.com', 'UK', 'GB')
ON CONFLICT (name) DO NOTHING;

-- RLS policies (open for authenticated users)
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Operators are viewable by authenticated users" ON operators;
CREATE POLICY "Operators are viewable by authenticated users"
  ON operators FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Operators are viewable by anyone" ON operators;
CREATE POLICY "Operators are viewable by anyone"
  ON operators FOR SELECT
  TO anon
  USING (active = true);
