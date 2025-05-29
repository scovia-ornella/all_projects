/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom SmartPark colors
        'smartpark-bg': '#faedcd',
        'smartpark-nav': '#023e8a',
        'smartpark-text': '#023e8a',
        'smartpark-light': '#faedcd',

        // Default theme colors
        border: "#023e8a",
        input: "#023e8a",
        ring: "#023e8a",
        background: "#faedcd",
        foreground: "#023e8a",
        primary: {
          DEFAULT: "#023e8a",
          foreground: "#faedcd",
        },
        secondary: {
          DEFAULT: "#faedcd",
          foreground: "#023e8a",
        },
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "#faedcd",
          foreground: "#023e8a",
        },
        accent: {
          DEFAULT: "#faedcd",
          foreground: "#023e8a",
        },
        popover: {
          DEFAULT: "#faedcd",
          foreground: "#023e8a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#023e8a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
