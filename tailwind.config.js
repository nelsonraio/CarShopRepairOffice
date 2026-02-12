/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        'brand-yellow': {
          light: '#fef3c7', // yellow-200
          DEFAULT: '#facc15', // yellow-400
          dark: '#eab308',  // yellow-500
        },
      }
    },
  },
  plugins: [],
}
