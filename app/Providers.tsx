// app/Providers.tsx
"use client";

import { ReactNode, useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline, PaletteMode } from "@mui/material";
import { getDesignTokens } from "@/utils/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Header from "./components/Header";
import { motion, AnimatePresence } from "framer-motion";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [mode, setMode] = useState<PaletteMode>("light");

  useEffect(() => {
    const storedMode = localStorage.getItem("theme") as PaletteMode;
    if (storedMode) {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Header mode={mode} onThemeToggle={toggleTheme} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={mode}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              style={{ minHeight: "80vh" }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
