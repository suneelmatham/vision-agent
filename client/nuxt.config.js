// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  app: {
    head: {
      title: 'Vision Agent'
    }
  },
  vite: {
    optimizeDeps: {
      exclude: ["whisper-turbo"],
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      BACKEND_IP: process.env.BACKEND_IP
    },
  },
  sourcemap: {
    client: true,
    server: true,
  },
});
