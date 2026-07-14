/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        viaduct: {
          background: "rgb(var(--viaduct-bg) / <alpha-value>)",
          surface: "rgb(var(--viaduct-surface) / <alpha-value>)",
          border: "rgb(var(--viaduct-border) / <alpha-value>)",
          text: {
            primary: "rgb(var(--viaduct-text-primary) / <alpha-value>)",
            secondary: "rgb(var(--viaduct-text-secondary) / <alpha-value>)",
          },
          accent: "rgb(var(--viaduct-accent) / <alpha-value>)",
          muted: "rgb(var(--viaduct-muted) / <alpha-value>)",
          glow: "rgb(var(--viaduct-glow) / <alpha-value>)",
          card: "rgb(var(--viaduct-card) / <alpha-value>)",
        },
        stellar: {
          blue: "rgb(var(--viaduct-accent) / <alpha-value>)",
          dark: "rgb(var(--viaduct-bg) / <alpha-value>)",
          card: "rgb(var(--viaduct-card) / <alpha-value>)",
          border: "rgb(var(--viaduct-border) / <alpha-value>)",
          surface: "rgb(var(--viaduct-surface) / <alpha-value>)",
          "text-muted": "rgb(var(--viaduct-muted) / <alpha-value>)",
          text: {
            primary: "rgb(var(--viaduct-text-primary) / <alpha-value>)",
            secondary: "rgb(var(--viaduct-text-secondary) / <alpha-value>)",
            muted: "rgb(var(--viaduct-muted) / <alpha-value>)",
          },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 12px -2px rgb(var(--viaduct-glow) / 0.15)',
        'glow': '0 0 24px -4px rgb(var(--viaduct-glow) / 0.2)',
        'glow-lg': '0 0 48px -8px rgb(var(--viaduct-glow) / 0.25)',
        'premium': '0 4px 24px -4px rgb(0 0 0 / 0.15), 0 0 0 1px rgb(var(--viaduct-border))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
