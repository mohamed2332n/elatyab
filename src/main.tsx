import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { getEnvVariable } from "@/lib/env";

// Validate required environment variables at startup
const validateEnvVariables = () => {
  const requiredVars = [
    // Add any required VITE_ prefixed environment variables here
  ];
  const missingVars = requiredVars.filter(
    (varName) => {
      try {
        getEnvVariable(varName);
        return false;
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