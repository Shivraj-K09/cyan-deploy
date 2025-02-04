import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import mkcert from "vite-plugin-mkcert";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: { https: true },
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Vite PWA Project",
        short_name: "Vite PWA Project",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // Add workbox configuration
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000, // Increase cache limit to 3MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i, // Adjust this pattern for your API calls
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
  ],
  // Add build optimization configuration
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            // Add other large dependencies here
          ],
          // Split features into separate chunks
          features: [
            // Add paths to your feature modules
            // Example: './src/features/dashboard',
            // './src/features/auth',
          ],
        },
      },
    },
    // Add chunk size warning limit
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
  },
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
