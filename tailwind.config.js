/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background-primary': 'var(--background-primary)',
        'background-secondary': 'var(--background-secondary)',
        'background-tertiary': 'var(--background-tertiary)',
        'background-hover': 'var(--background-hover)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-placeholder': 'var(--text-placeholder)',
        'text-link': 'var(--text-link)',
        'border-primary': 'var(--border-primary)',
        'card-background': 'var(--card-background)',
        'input-background': 'var(--input-background)',
        'button-primary-bg': 'var(--button-primary-bg)',
        'button-primary-text': 'var(--button-primary-text)',
        'scrollbar-thumb': 'var(--scrollbar-thumb)',
        'scrollbar-track': 'var(--scrollbar-track)',
      }
    },
  },
  plugins: [],
}