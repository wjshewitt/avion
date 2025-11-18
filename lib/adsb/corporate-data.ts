export const CORPORATE_AIRCRAFT_TYPES = [
  // Gulfstream
  'G150', 'G200', 'G280', 'GLF3', 'GLF4', 'GLF5', 'GLF6', 'GLEX', 'G650', 'G500', 'G550', 'G450', 'G400', 'G350', 'G300', 'G200', 'G150', 'G100', 'GIV', 'GV', 
  
  // Bombardier
  'CL30', 'CL35', 'CL60', 'GL5T', 'GLEX', 'GL6T', 'GL7T', 'GL8T', 'LJ31', 'LJ35', 'LJ40', 'LJ45', 'LJ55', 'LJ60', 'LJ70', 'LJ75',
  'CRJ1', 'CRJ2', 'CRJ7', 'CRJ9', 'CRJX', // Often used as corporate shuttles but also airlines
  
  // Cessna
  'C500', 'C501', 'C510', 'C525', 'C550', 'C551', 'C560', 'C56X', 'C650', 'C680', 'C68A', 'C700', 'C750',
  'C208', // Caravan
  
  // Dassault Falcon
  'FA10', 'FA20', 'FA50', 'FA7X', 'FA8X', 'FA90', 'FA6X', 'F2TH', 'F900',
  
  // Embraer
  'E55P', 'E50P', 'E35L', 'E135', 'E145', 'E545', 'E550', 'E600', 'E650', // Praetor/Legacy
  
  // Pilatus
  'PC12', 'PC24',
  
  // Honda
  'HDJT',
  
  // Beechcraft
  'BE40', 'BE4W', 'BE9L', 'B350', 'BE20', 'BE30', 'BE99',
  
  // Cirrus
  'SF50', 'SR22', 'SR20',
  
  // TBM
  'TBM7', 'TBM8', 'TBM9',
  
  // Piper
  'PA46', 'PAY2', 'PAY3', 'PAY4'
];

// Static fallback for known corporate operators if the SSOT is empty or unavailable
export const STATIC_CORPORATE_OPERATORS = [
  'EJA', // NetJets Aviation
  'NJE', // NetJets Europe
  'EJM', // Executive Jet Management
  'LXJ', // Flexjet
  'VIST', // VistaJet
  'GJET', // GlobeAir
  'AHO', // Air Hamburg
  'PTN', // Platoon Aviation
  'TAG', // TAG Aviation
  'TAY', // TNT Airways (sometimes cargo/charter)
  'JFA', // Jetfly
  'AOJ', // Avcon Jet
  'VJT', // VistaJet
  'XRO', // ExxAero
];
