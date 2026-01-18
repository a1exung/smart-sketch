import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
          elevated: "var(--background-elevated)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          muted: "var(--foreground-muted)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
        },
        surface: {
          glass: "var(--surface-glass)",
          border: "var(--surface-border)",
          "border-light": "var(--surface-border-light)",
        },
      },
      boxShadow: {
        "glow-primary": "0 0 20px var(--primary-glow)",
        "glow-accent": "0 0 20px var(--accent-glow)",
        "glow-lg-primary": "0 0 40px var(--primary-glow)",
        "glow-lg-accent": "0 0 40px var(--accent-glow)",
        card: "0 4px 20px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-down": "fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in-scale": "fade-in-scale 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-left": "slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-surface": "var(--gradient-surface)",
        "gradient-glow": "var(--gradient-glow)",
      },
    },
  },
  plugins: [],
};
export default config;
