export const GROUP_OBJECTIVES = ['Coleta', 'PvP'];

export const ROLE_TYPES = ['Coleta', 'Ataque'];

export const FILTER_INTERESTS = ['Coleta', 'PvP'];

export const REQUIRED_TOOLS = [
  'Ferramentas de Minério',
  'Ferramentas de Especiaria'
];

// Ajustado para níveis de 1 a 200
export const MIN_LEVEL_OPTIONS = Array.from({ length: 200 }, (_, i) => (i + 1).toString());

// Reuse equipment tiers from existing constants
export const FILTER_EQUIPMENT_TIERS = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6'
];