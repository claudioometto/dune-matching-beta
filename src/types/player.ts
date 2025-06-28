export interface PlayerData {
  nickname: string;
  gameId: string;
  email: string;
  age: string;
  server: string;
  level: string;
  weaponTier: string;
  armorTier: string;
  ornithopterTier: string;
  miningToolsTier: string;
  spiceToolsTier: string;
  interests: string[];
  hasDeepDesertBase: boolean;
  baseSector: string;
}

export interface FormErrors {
  [key: string]: string;
}