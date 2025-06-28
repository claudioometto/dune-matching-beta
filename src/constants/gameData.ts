export const SERVERS = [
  'América do Sul',
  'América do Norte', 
  'Europa',
  'Ásia',
  'Outros'
];

export const EQUIPMENT_TIERS = [
  'T1 - Tier 1', 
  'T2 - Tier 2', 
  'T3 - Tier 3', 
  'T4 - Tier 4', 
  'T5 - Tier 5', 
  'T6 - Tier 6'
];

export const TOOL_TIERS = [
  'T1 - Tier 1', 
  'T2 - Tier 2', 
  'T3 - Tier 3', 
  'T4 - Tier 4', 
  'T5 - Tier 5', 
  'T6 - Tier 6'
];

export const INTEREST_OPTIONS = ['Coleta', 'PvP'];

// Generate sectors A1-I9
export const SECTORS = (() => {
  const sectors = [];
  for (let letter = 'A'; letter <= 'I'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)) {
    for (let number = 1; number <= 9; number++) {
      sectors.push(`${letter}${number}`);
    }
  }
  return sectors;
})();