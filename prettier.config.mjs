const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/styles/globals.css",
  tailwindFunctions: ["cn", "cva"],
  printWidth: 100,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  endOfLine: "lf",
};

export default config;
