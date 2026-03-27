/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#059669',
          container: '#d1fae5',
          on: '#ffffff',
        },
        secondary: {
          DEFAULT: '#10b981',
          container: '#ecfdf5',
          on: '#064e3b',
        },
        tertiary: {
          DEFAULT: '#4b5563',
          container: '#f3f4f6',
          on: '#111827',
        },
        surface: {
          lowest: '#f9fafb',
          low: '#f3f4f6',
          high: '#e5e7eb',
          highest: '#d1d5db',
          bright: '#ffffff',
        },
        background: '#ffffff',
      },
    },
  },
  plugins: [],
}
