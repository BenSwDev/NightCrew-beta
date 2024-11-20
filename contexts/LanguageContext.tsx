// contexts/LanguageContext.tsx
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useTheme } from "@mui/material/styles";
import { create } from "jss";
import rtl from "jss-rtl";
import { StylesProvider, jssPreset } from "@mui/styles";

// Define the shape of the context
interface LanguageContextProps {
  language: "en" | "he";
  setLanguage: (language: "en" | "he") => void;
}

// Create the context with default values
export const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  setLanguage: () => {},
});

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"en" | "he">("en");

  useEffect(() => {
    // Optionally, retrieve the preferred language from localStorage
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("preferredLanguage") as "en" | "he" | null;
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
