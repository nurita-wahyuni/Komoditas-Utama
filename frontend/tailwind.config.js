/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F4F6F9", // Main Background
        foreground: "#0F2A44", // Primary Text

        // --- DESIGN SYSTEM COLORS ---
        primary: {
          DEFAULT: "#0072CE", // Brand Core
          50: "#E6F2FF", // Hover Soft Blue
          100: "#CCE4FF",
          200: "#99C9FF",
          300: "#66ADFF",
          400: "#3392FF",
          500: "#0072CE", // Brand Core
          600: "#005BB3",
          700: "#004488",
          800: "#002D5A",
          900: "#00172D",
        },
        dark: {
          DEFAULT: "#0F2A44", // Structural Background (Dark Primary)
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53",
          900: "#0F2A44", // Base Dark
          950: "#102A43",
        },
        accent: {
          DEFAULT: "#F58220", // Call To Action
          foreground: "#FFFFFF",
          50: "#FFF2E5",
          100: "#FFE6CC",
          200: "#FFCC99",
          300: "#FFB366",
          400: "#FF9933",
          500: "#F58220", // Base Accent
          600: "#CC6D1B",
          700: "#A35715",
          800: "#7A4110",
          900: "#522B0B",
        },
        success: {
          DEFAULT: "#6DBE45", // Positive Data Indicator
          50: "#F0F9EC",
          100: "#E1F3DA",
          200: "#C3E7B6",
          300: "#A5DB92",
          400: "#87CF6E",
          500: "#6DBE45", // Base Success
          600: "#5BA139",
          700: "#49842E",
          800: "#366623",
          900: "#244817",
        },

        // Text Hierarchy
        text: {
          primary: "#0F2A44",
          secondary: "#6B7C93",
          muted: "#9AA7B5",
          white: "#FFFFFF",
        },

        // Surface Colors
        surface: {
          card: "#FFFFFF",
          hover: "#E6F2FF",
          divider: "#E3E8EE",
        },

        // Legacy/Utility mappings
        secondary: {
          DEFAULT: "#6B7C93", // Mapped to secondary text for now or slate equivalent
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#9AA7B5",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F2A44",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F2A44",
        },
      },
      borderRadius: {
        lg: "20px", // Card Radius
        md: "16px", // Element Radius
        sm: "8px", // Small Element Radius
        full: "999px", // Pill Shape
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(15, 42, 68, 0.05)", // Soft layered shadow
        card: "0 0 0 1px #E3E8EE, 0 4px 12px rgba(15, 42, 68, 0.04)", // Card shadow with border
        elevation: "0 10px 30px -5px rgba(15, 42, 68, 0.1)", // Hover elevation
        glow: "0 0 15px rgba(0, 114, 206, 0.3)", // Primary glow
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(to right, #0072CE, #005BB3)",
        "gradient-dark": "linear-gradient(to bottom, #0F2A44, #0A1F33)", // Subtle navy gradient
        "gradient-glass":
          "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
