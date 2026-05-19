/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Define aquí tu sistema de diseño por proyecto
      colors: {
        // primary: { 50: '...', 500: '...', 900: '...' },
      },
      fontFamily: {
        // sans: ['Inter', 'system-ui'],
      },
    },
  },
  plugins: [],
};
