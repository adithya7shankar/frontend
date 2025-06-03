import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#FDFCFB',
        'warm-surface': '#FFFFFF',
        'warm-text-primary': '#4A4A4A',
        'warm-text-secondary': '#7B7B7B',
        'calm-blue-accent': '#5E8B9D',
        'calm-blue-accent-hover': '#4A6F7D',
        'warm-border-soft': '#EAEAEA',
        'warm-border-medium': '#D1D1D1',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-lora)', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
