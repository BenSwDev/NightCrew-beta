// contexts/NotificationContext.tsx
"use client";

import React, { createContext, useState, ReactNode, FC } from "react";
import { Snackbar, Alert } from "@mui/material";

interface NotificationContextType {
  notify: (
    message: string,
    severity?: "success" | "error" | "warning" | "info"
  ) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export const NotificationProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const notify = (
    msg: string,
    sev: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
