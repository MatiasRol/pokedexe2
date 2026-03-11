export const TYPE_COLORS: { [key: string]: string } = {
  normal:   'bg-gray-400',
  fire:     'bg-orange-500',
  water:    'bg-blue-500',
  electric: 'bg-yellow-400',
  grass:    'bg-green-500',
  ice:      'bg-cyan-400',
  fighting: 'bg-red-600',
  poison:   'bg-purple-500',
  ground:   'bg-yellow-600',
  flying:   'bg-indigo-400',
  psychic:  'bg-pink-500',
  bug:      'bg-lime-500',
  rock:     'bg-yellow-700',
  ghost:    'bg-purple-700',
  dragon:   'bg-indigo-600',
  dark:     'bg-gray-700',
  steel:    'bg-gray-500',
  fairy:    'bg-pink-400',
};

export const getTypeColor = (type: string): string =>
  TYPE_COLORS[type] ?? 'bg-gray-400';

// Para marcadores del mapa (hex/rgba)
export const TYPE_HEX: Record<string, string> = {
  grass:    '#4ade80',
  bug:      '#a3e635',
  fairy:    '#f9a8d4',
  normal:   '#d1d5db',
  water:    '#60a5fa',
  ice:      '#67e8f9',
  electric: '#fde047',
  fire:     '#fb923c',
  rock:     '#a8a29e',
  ground:   '#d97706',
  fighting: '#ef4444',
  flying:   '#818cf8',
  psychic:  '#ec4899',
  dark:     '#6b7280',
  ghost:    '#8b5cf6',
  dragon:   '#6366f1',
  poison:   '#a855f7',
  steel:    '#94a3b8',
};

export const getTypeHex = (type?: string): string =>
  TYPE_HEX[type ?? 'normal'] ?? '#d1d5db';
