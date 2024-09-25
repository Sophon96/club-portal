const isProduction =
  process.env.NODE_ENV === "production" || process.env.CONTEXT === "production";

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(isProduction === "production" ? { cssnano: {} } : {}),
  },
};
