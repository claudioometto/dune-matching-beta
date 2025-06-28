export const GROUP_OBJECTIVES = ['Coleta', 'PvP'];

export const ROLE_TYPES = ['Coleta', 'Ataque'];

export const FILTER_INTERESTS = ['Coleta', 'PvP'];

export const REQUIRED_TOOLS = [
  'Ferramentas de Minério',
  'Ferramentas de Especiaria'
];

export const MIN_LEVEL_OPTIONS = Array.from({ length: 60 }, (_, i) => (i + 1).toString());

// Reuse equipment tiers from existing constants
export const FILTER_EQUIPMENT_TIERS = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6'
];