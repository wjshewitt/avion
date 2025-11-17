-- Clean migration for operators table
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Create operators table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_operators_name ON operators(name);
CREATE INDEX IF NOT EXISTS idx_operators_domain ON operators(domain);
CREATE INDEX IF NOT EXISTS idx_operators_active ON operators(active) WHERE active = true;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_operators_updated_at ON operators;
CREATE TRIGGER update_operators_updated_at
  BEFORE UPDATE ON operators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial European operators
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

-- Insert additional major global operators (seed ~100 total)
INSERT INTO operators (name, domain, region, country_code) VALUES
  -- North America
  ('NetJets', 'netjets.com', 'North America', 'US'),
  ('Flexjet USA', 'flexjet.com', 'North America', 'US'),
  ('Wheels Up', 'wheelsup.com', 'North America', 'US'),
  ('XO', 'flyxo.com', 'North America', 'US'),
  ('Jet Linx Aviation', 'jetlinx.com', 'North America', 'US'),
  ('PlaneSense', 'planesense.com', 'North America', 'US'),
  ('Airshare', 'flyairshare.com', 'North America', 'US'),
  ('flyExclusive', 'flyexclusive.com', 'North America', 'US'),
  ('Solairus Aviation', 'solairus.aero', 'North America', 'US'),
  ('JetSuite / JSX', 'jsx.com', 'North America', 'US'),
  ('Clay Lacy Aviation', 'claylacy.com', 'North America', 'US'),
  ('Jet Aviation US', 'jetaviation.com', 'North America', 'US'),
  ('Gama Aviation Signature', 'gamaaviation.com', 'North America', 'US'),
  ('Contour Aviation', 'contouraviation.com', 'North America', 'US'),
  ('Priester Aviation', 'priesterav.com', 'North America', 'US'),
  ('Executive Jet Management', 'ejmjets.com', 'North America', 'US'),
  ('Jet Edge International', 'flyjetedge.com', 'North America', 'US'),
  -- Magellan operates primarily as a broker; omit from core operator seed
  ('Nicholas Air', 'nicholasair.com', 'North America', 'US'),
  ('Delta Private Jets', 'deltaprivatejets.com', 'North America', 'US'),
  ('Jet Access Aviation', 'jetaccess.com', 'North America', 'US'),
  ('Jet Linx Charter', 'jetlinx.com', 'North America', 'US'),
  -- ONEflight is a broker/platform; omit from core operator seed
  ('GrandView Aviation', 'flygv.com', 'North America', 'US'),
  ('Jet Linx Omaha', 'jetlinx.com', 'North America', 'US'),
  ('Falcon Aviation Services USA', 'falconaviation.com', 'North America', 'US'),
  ('Northern Jet', 'northernjets.com', 'North America', 'US'),
  ('Warren Henry Aviation', 'warrenhenryaviation.com', 'North America', 'US'),
  ('Solairus Managed Fleet', 'solairus.aero', 'North America', 'US'),

  -- Europe & UK (additional to initial seed)
  ('Jet Aviation Europe', 'jetaviation.com', 'Pan-European', 'EU'),
  ('Gama Aviation Europe', 'gamaaviation.com', 'Pan-European', 'EU'),
  ('Avcon Jet', 'avconjet.at', 'Austria', 'AT'),
  ('GainJet Aviation', 'gainjet.com', 'Greece', 'GR'),
  ('Société de Transport Aérien (Luxaviation France)', 'luxaviation.com', 'France', 'FR'),
  ('AirX Charter', 'airx.aero', 'Malta', 'MT'),
  ('Luxaviation UK', 'luxaviation.com', 'UK', 'GB'),
  ('Luxaviation Germany', 'luxaviation.com', 'Germany', 'DE'),
  ('Luxaviation Belgium', 'luxaviation.com', 'Belgium', 'BE'),
  ('GlobeAir Italy', 'globeair.com', 'Italy', 'IT'),
  ('Gestair', 'gestair.com', 'Spain', 'ES'),
  ('ASL Group', 'aslgroup.eu', 'Belgium', 'BE'),
  ('Flyinggroup', 'flyinggroup.aero', 'Belgium', 'BE'),
  ('SaxonAir', 'saxonair.com', 'UK', 'GB'),
  ('Hahn Air Lines', 'hahnair.com', 'Germany', 'DE'),
  ('DragonFly Executive Air Charter', 'dragonfly-air.co.uk', 'UK', 'GB'),
  ('Platoon Aviation', 'platoon-aviation.com', 'Germany', 'DE'),

  -- Middle East & Africa
  ('Qatar Executive', 'qatarexecutive.com.qa', 'Middle East', 'QA'),
  ('Emirates Executive', 'emirates.com', 'Middle East', 'AE'),
  ('Saudia Private Aviation', 'saudiaprivate.com', 'Middle East', 'SA'),
  ('Jetex Flight Support', 'jetex.com', 'Middle East', 'AE'),
  ('Royal Jet', 'royaljetgroup.com', 'Middle East', 'AE'),
  ('Empire Aviation Group', 'empireaviation.com', 'Middle East', 'AE'),
  ('ExecuJet Middle East', 'execujet.com', 'Middle East', 'AE'),
  ('NASJet', 'nasjet.com.sa', 'Middle East', 'SA'),
  ('DC Aviation Al-Futtaim', 'dc-aviation.ae', 'Middle East', 'AE'),
  ('National Airways Corporation', 'nac.co.za', 'Africa', 'ZA'),
  ('Absolute Aviation', 'absoluteaviation.co.za', 'Africa', 'ZA'),

  -- Asia-Pacific
  ('TAG Aviation Asia', 'tagaviation.com', 'Asia-Pacific', 'HK'),
  ('Sino Jet', 'sinojet.org', 'Asia-Pacific', 'CN'),
  ('HK Bellawings', 'hkbellawings.com', 'Asia-Pacific', 'HK'),
  ('Deer Jet', 'deerjet.com', 'Asia-Pacific', 'CN'),
  ('China Minsheng Jet', 'cmjet.com', 'Asia-Pacific', 'CN'),
  ('Metrojet', 'metrojet.com', 'Asia-Pacific', 'HK'),
  ('Jet Aviation Asia', 'jetaviation.com', 'Asia-Pacific', 'SG'),
  ('ExecuJet Asia', 'execujet.com', 'Asia-Pacific', 'SG'),
  ('PhilJets', 'philjets.com', 'Asia-Pacific', 'PH'),
  ('Jetstar Asia Business Charter', 'jetstar.com', 'Asia-Pacific', 'SG'),
  ('ExecuJet Australia', 'execujet.com', 'Australia', 'AU'),
  ('Avia Solutions Group Business Jets', 'aviasg.com', 'Europe', 'LT')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
