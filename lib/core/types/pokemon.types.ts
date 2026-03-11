export interface Pokemon {
    id: number;
    name: string;
    sprites: {
      other: {
        'official-artwork': {
          front_default: string;
        };
      };
      front_default: string;
    };
    types: Array<{
      type: {
        name: string;
      };
    }>;
    stats: Array<{
      base_stat: number;
      stat: {
        name: string;
      };
    }>;
    height: number;
    weight: number;
    abilities: Array<{
      ability: {
        name: string;
      };
    }>;
  }
  