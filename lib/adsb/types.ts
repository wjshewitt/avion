export interface AirplanesLiveState {
  hex: string;
  type: string;
  flight: string;
  r: string; // registration
  t: string; // type
  alt_baro: number | "ground";
  alt_geom: number;
  gs: number;
  track: number;
  baro_rate: number;
  squawk: string;
  emergency: string;
  category: string;
  nav_qnh: number;
  nav_altitude_mcp: number;
  nav_heading: number;
  lat: number;
  lon: number;
  nic: number;
  rc: number;
  seen_pos: number;
  version: number;
  nic_baro: number;
  nac_p: number;
  nac_v: number;
  sil: number;
  sil_type: string;
  gva: number;
  sda: number;
  alert: number;
  spi: number;
  mlat: string[];
  tisb: string[];
  messages: number;
  seen: number;
  rssi: number;
}

export interface AirplanesLiveResponse {
  now: number;
  messages: number;
  aircraft: AirplanesLiveState[];
}

export interface AdsbDbAircraft {
  type: string;
  icao_type: string;
  manufacturer: string;
  mode_s: string;
  registration: string;
  registered_owner_country_iso_name: string;
  registered_owner_country_name: string;
  registered_owner_operator_flag_code: string | null;
  registered_owner: string;
  url_photo: string | null;
  url_photo_thumbnail: string | null;
}

export interface AdsbDbResponse {
  response: {
    aircraft: AdsbDbAircraft;
  };
}

export interface TrackedAircraft {
  icao24: string;
  callsign: string;
  registration?: string;
  type?: string;
  lat: number;
  lon: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
  squawk?: string;
  lastContact: number;
}
