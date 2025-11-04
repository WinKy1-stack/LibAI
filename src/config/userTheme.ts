export const lightTheme = {
  // Backgrounds
  '--background-primary': '#FFFFFF',
  '--background-secondary': '#F7F7F8',
  '--background-tertiary': '#F0F0F2',
  '--background-hover': '#EAEAEB',

  // Text
  '--text-primary': '#1A1A1A',
  '--text-secondary': '#6B6B6E',
  '--text-placeholder': '#9A9A9C',
  '--text-link': '#8A2BE2',

  // Borders
  '--border-primary': '#E0E0E2',

  // Components
  '--card-background': '#FFFFFF',
  '--input-background': '#F7F7F8',
  '--button-primary-bg': 'linear-gradient(to right, #D946EF, #8B5CF6)',
  '--button-primary-text': '#FFFFFF',

  // Special
  '--scrollbar-thumb': '#C5C5C7',
  '--scrollbar-track': '#F0F0F2',
};

export const darkTheme = {
  // Backgrounds
  '--background-primary': '#1A1A1A',
  '--background-secondary': '#232323',
  '--background-tertiary': '#2C2C2E',
  '--background-hover': '#353537',

  // Text
  '--text-primary': '#F0F0F2',
  '--text-secondary': '#9A9A9C',
  '--text-placeholder': '#6B6B6E',
  '--text-link': '#A020F0',

  // Borders
  '--border-primary': '#353537',

  // Components
  '--card-background': '#232323',
  '--input-background': '#2C2C2E',
  '--button-primary-bg': 'linear-gradient(to right, #C026D3, #7C3AED)',
  '--button-primary-text': '#F0F0F2',

  // Special
  '--scrollbar-thumb': '#4D4D4F',
  '--scrollbar-track': '#2C2C2E',
};

export type Theme = typeof lightTheme;