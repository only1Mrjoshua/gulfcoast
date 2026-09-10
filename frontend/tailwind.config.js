/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:        '#008296',
        'primary-dark': '#006a7a',
        'primary-deep': '#005d6b',
        'deep-accent':  '#003256',
        canvas:         '#fefefe',
        ink:            '#000000',
        body:           '#495867',
        muted:          '#666666',
        faint:          '#f4f4f4',
        hairline:       '#e7e7e7',
        accent:         '#f2672a',
        'card-accent':  '#d46432',
      },
      fontFamily: {
        sans:  ['Lato', 'Helvetica Neue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif"', 'Georgia', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
};