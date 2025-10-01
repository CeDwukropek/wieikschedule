/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    // list exact classes or patterns you use for accents + matching text classes
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "text-red-500",
    "text-green-500",
    "text-blue-500",
    "text-yellow-500",
    // or a pattern:
    {
      pattern:
        /^(bg|text)-(red|green|blue|yellow|indigo|purple|pink)-(400|500|600)$/,
    },
  ],
};
