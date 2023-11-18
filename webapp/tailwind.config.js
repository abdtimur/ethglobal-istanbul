/** @type {import('tailwindcss').Config} */
export default {
  daisyui: {
    themes: ['wireframe']
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui")
  ],
}