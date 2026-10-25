/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFCFA",
          100: "#FFF8F2",
          200: "#F9DFCC",
        },
        lavender: {
          50: "#F7F1FC",
          100: "#E9DDF7",
          200: "#D8C6EE",
          300: "#C4A9DC",
          400: "#A78BCA",
          500: "#7A5EA8",
          700: "#563F68",
        },
        rose: {
          50: "#FFF5F8",
          100: "#F6C1CF",
          200: "#ECA8BA",
          400: "#D987A3",
          500: "#C56B8A",
          700: "#8E4A62",
        },
        ink: {
          500: "#7A6788",
          700: "#563F68",
          900: "#3D2C4A",
        },
        blush: "#F6C1CF",
        peach: "#F9DFCC",
        plum: {
          DEFAULT: "#563F68",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Iowan Old Style", "Palatino Linotype", "Nirmala UI", "Georgia", "serif"],
        sans: ["Nunito Sans", "Nirmala UI", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 40px -24px rgba(86, 63, 104, 0.35)",
        soft: "0 10px 28px -18px rgba(86, 63, 104, 0.28)",
        float: "0 22px 48px -28px rgba(86, 63, 104, 0.42)",
      },
      borderRadius: {
        "2.5xl": "1.4rem",
      },
    },
  },
  plugins: [],
};
