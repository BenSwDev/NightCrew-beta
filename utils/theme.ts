import { PaletteMode } from "@mui/material";
import { deepPurple, amber, teal, grey, pink } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode palette
          primary: {
            main: deepPurple[600],
            contrastText: "#fff",
          },
          secondary: {
            main: amber[500],
            contrastText: "#000",
          },
          error: {
            main: pink[700],
          },
          background: {
            default: "#f4f6f8",
            paper: "#ffffff",
          },
          text: {
            primary: "#1f2937",
            secondary: grey[700],
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: deepPurple[300],
            contrastText: "#000",
          },
          secondary: {
            main: teal[500],
            contrastText: "#000",
          },
          error: {
            main: pink[400],
          },
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
          text: {
            primary: "#ffffff",
            secondary: grey[400],
          },
          divider: grey[700],
          action: {
            hover: grey[800],
            selected: grey[900],
            disabled: grey[600],
            disabledBackground: grey[700],
          },
        }),
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: {
      fontWeight: 700,
      color: "text.primary",
    },
    h5: {
      fontWeight: 600,
      color: "text.primary",
    },
    h6: {
      fontWeight: 600,
      color: "text.primary",
    },
    body1: {
      color: "text.primary",
    },
    body2: {
      color: "text.secondary",
    },
    button: {
      textTransform: "none" as "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 20px",
          transition: "background-color 0.3s ease, transform 0.2s ease",
          "&:hover": {
            backgroundColor: mode === "light" ? deepPurple[700] : deepPurple[400],
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${mode === "light" ? grey[300] : grey[700]}`,
          boxShadow: "none",
          backgroundColor: mode === "light" ? "#ffffff" : "#1e1e1e",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: mode === "light" ? grey[500] : teal[300],
          "&.Mui-checked": {
            color: mode === "light" ? deepPurple[700] : teal[500],
          },
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: mode === "light" ? deepPurple[700] : teal[500],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow:
            mode === "light"
              ? "0 4px 12px rgba(0,0,0,0.1)"
              : "0 4px 12px rgba(0,0,0,0.5)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          backgroundColor: mode === "light" ? "#ffffff" : "#1e1e1e",
        },
      },
    },
  },
});
