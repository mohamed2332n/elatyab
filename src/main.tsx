import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { getEnvVariable } from "@/lib/env";

// Validate required environment variables at startup
const validateEnvVariables = () => {
  const requiredVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
  ];
  const missingVars = requiredVars.filter(
    (varName) => {
      try {
        const val = import.meta.env[varName];
        return !val;
      } catch {
        return true;
      }
    }
  );

  if (missingVars.length > 0) {
    console.warn(
      "Missing required environment variables:",
      missingVars.join(", ")
    );
    console.info(
      "Please check your .env file and ensure all required variables are set with VITE_ prefix."
    );
  }
};

// Run validation in development mode
if (import.meta.env.DEV) {
  validateEnvVariables();
}

// NOTE: Security headers like X-Frame-Options and X-Content-Type-Options 
// are configured in vite.config.ts (development) and vercel.json (production)
// as they must be delivered as HTTP response headers, not meta tags.

createRoot(document.getElementById("root")!).render(<App />);