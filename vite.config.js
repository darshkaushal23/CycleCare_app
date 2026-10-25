import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts") || id.includes("node_modules/victory-vendor") || id.includes("node_modules/d3-")) {
            return "charts";
          }
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react-router") || id.includes("node_modules/react/")) {
            return "react";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
        },
      },
    },
  },
});
