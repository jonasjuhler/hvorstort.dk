import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    minify: "terser",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          mantine: ["@mantine/core", "@mantine/hooks"],
          charts: ["recharts"],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
