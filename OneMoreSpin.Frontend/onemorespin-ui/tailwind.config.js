/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Mówi Tailwindowi, aby skanował główny plik index.html
    "./src/**/*.{js,ts,jsx,tsx}", // Mówi Tailwindowi, aby skanował WSZYSTKIE pliki React/TypeScript w folderze /src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
