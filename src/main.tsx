import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Validate required environment variables at startup
const validateEnvVariables = () => {
  const requiredVars = [
    // Add any required VITE_ prefixed environment variables here
    // Example: 'VITE_API_URL'
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      "Missing required environment variables:",
      missingVars.join(", ")
    );
    console.info(
      "Please check your .env file and ensure all required variables are set."
    );
  }
};

// Run validation in development mode
if (import.meta.env.DEV) {
  validateEnvVariables();
}

createRoot(document.getElementById("root")!).render(<App />);