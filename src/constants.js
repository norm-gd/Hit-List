export const MAX_URL_LENGTH = 50000;

export const NAV_ITEMS = [
  { key: 'canvas', label: 'CANVAS', icon: 'dashboard' },
  { key: 'commands', label: 'COMMANDS', icon: 'terminal' }
];

export const POWER_COLORS = [
  { name: 'YELLOW', value: '#f6ffc0' },
  { name: 'PINK', value: '#ff51fa' },
  { name: 'CYAN', value: '#c1fffe' },
  { name: 'ORANGE', value: '#ff7351' },
  { name: 'LIME', value: '#daf900' }
];

export const PALETTE = POWER_COLORS.map(c => c.value);
