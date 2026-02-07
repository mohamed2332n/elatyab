import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure environment variables are properly handled
  envPrefix: 'VITE_', // Only expose VITE_ prefixed variables to client
  define: {
    // Prevents accidental exposure of non-VITE_ prefixed environment variables
    __APP_ENV__: JSON.stringify(import.meta.env.VITE_APP_ENV || 'development'),
  },
}));