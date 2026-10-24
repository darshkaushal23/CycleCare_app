/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF8",
          100: "#F8F2EA",
          200: "#F0E6D8",
        },
        lavender: {
          50: "#F6F3FB",
          100: "#EDE7F6",
          200: "#D9CEEC",
          300: "#B9A7D9",
          400: "#8F78BE",
          500: "#6F57A5",
          700: "#4E3B78",
        },
        rose: {
          50: "#FDF6F7",
          100: "#F8E6E9",
          200: "#F0C9D0",
          400: "#D48A96",
          500: "#C45B6C",
          700: "#8E3948",
        },
        ink: {
          500: "#6B6158",
          700: "#4A433C",
          900: "#2C2722",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Outfit"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -18px rgba(78, 59, 120, 0.35)",
        soft: "0 8px 24px -16px rgba(44, 39, 34, 0.25)",
      },
      borderRadius: {
        "2.5xl": "1.35rem",
      },
    },
  },
  plugins: [],
};
