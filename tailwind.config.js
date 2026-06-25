/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        f: {
          bg:          '#0D0D0D',
          card:        '#1A1A1A',
          'card-hi':   '#242424',
          border:      '#2A2A2A',
          accent:      '#00BCD4',
          'accent-dk': '#0097A7',
          text:        '#FFFFFF',
          muted:       '#777777',
          dim:         '#444444',
          success:     '#4CAF50',
        },
      },
    },
  },
  plugins: [],
}
