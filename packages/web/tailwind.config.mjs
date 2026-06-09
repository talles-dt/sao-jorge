/** @type {import('tailwindcss').Config} */
export default {
 content: [
 "./app/**/*.{js,ts,jsx,tsx,mdx}",
 "./components/**/*.{js,ts,jsx,tsx,mdx}",
 "./lib/**/*.{js,ts,jsx,tsx,mdx}",
 ],
 theme: {
 extend: {
 colors: {
 "lit-bg": "#1a1714",
 "lit-parchment": "#f5f0e8",
 "lit-gold": "#c4a35a",
 "lit-gold-dark": "#8b6914",
 "lit-red": "#8b1a1e",
 "lit-red-dark": "#5c1013",
 "lit-text": "#e8dcc8",
 "lit-text-secondary": "#b5a99a",
 "lit-muted": "#8a7f72",
 "lit-rubric": "#7a1515",
 },
 fontFamily: {
 display: [
 "'Noto Serif'",
 "Georgia",
 "'Palatino Linotype'",
 "serif",
 ],
 arabic: ["'Noto Naskh Arabic'", "'Scheherazade New'", "serif"],
 ui: ["system-ui", "-apple-system", "sans-serif"],
 },
 },
 },
 plugins: [],
};
