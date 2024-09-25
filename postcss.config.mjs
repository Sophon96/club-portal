const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.NETLIFY_CONTEXT === "production";

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(isProduction === "production" ? { cssnano: {} } : {}),
  },
};
