import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ["class", "dark"],
  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        darkBg: "#2D2D2D",
      },
    },
  },
  plugins: [],
}
export default config
