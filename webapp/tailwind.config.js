/** @type {import('tailwindcss').Config} */
export default {
  daisyui: {
    themes: ['sunset']
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