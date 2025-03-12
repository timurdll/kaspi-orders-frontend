// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      clipPath: {
        "tab-left": "polygon(0 0, 70% 0, 100% 100%, 0 100%)",
        "tab-right": "polygon(70% 0, 100% 0, 100% 100%, 100% 100%)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".clip-path-left": {
          clipPath: "polygon(0 0, 70% 0, 100% 100%, 0 100%)",
        },
        ".clip-path-right": {
          clipPath: "polygon(70% 0, 100% 0, 100% 100%, 100% 100%)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
