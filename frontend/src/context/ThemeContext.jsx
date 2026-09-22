import React, { createContext, useState, useContext, useMemo } from "react";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

const sharedTypography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  h1: { fontWeight: 700, fontSize: "1.8rem" },
  h2: { fontWeight: 700, fontSize: "1.5rem" },
  h3: { fontWeight: 600, fontSize: "1.25rem" },
  h4: { fontWeight: 600, fontSize: "1.15rem" },
  h5: { fontWeight: 600, fontSize: "1.05rem" },
  h6: { fontWeight: 600, fontSize: "0.95rem" },
  body1: { fontSize: "0.85rem" },
  body2: { fontSize: "0.8rem" },
  caption: { fontSize: "0.7rem" },
  subtitle1: { fontSize: "0.85rem", fontWeight: 500 },
  subtitle2: { fontSize: "0.8rem", fontWeight: 500 },
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        borderRadius: 8,
        padding: "6px 16px",
        fontSize: "0.8rem",
      },
      sizeSmall: { padding: "4px 12px", fontSize: "0.75rem" },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: 12, backgroundImage: "none" },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: { padding: "16px !important", "&:last-child": { paddingBottom: "16px !important" } },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": { borderRadius: 8 },
        "& .MuiInputBase-input": { fontSize: "0.85rem" },
        "& .MuiInputLabel-root": { fontSize: "0.85rem" },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontSize: "0.7rem", height: "22px" },
      sizeSmall: { fontSize: "0.65rem", height: "18px" },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: { fontSize: "0.8rem" },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: { padding: "8px 12px", fontSize: "0.8rem" },
      head: { fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: 12, margin: 16 },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: 36 },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: { minHeight: 36, fontSize: "0.8rem", fontWeight: 500, textTransform: "none" },
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      root: { minHeight: 40 },
      toolbar: { minHeight: 40 },
      selectLabel: { fontSize: "0.75rem" },
      displayedRows: { fontSize: "0.75rem" },
    },
  },
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6366f1", light: "#818cf8", dark: "#4f46e5" },
    secondary: { main: "#f43f5e", light: "#fb7185", dark: "#e11d48" },
    success: { main: "#10b981", light: "#34d399", dark: "#059669" },
    warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
    background: { default: "#0f172a", paper: "#1e293b" },
    text: { primary: "#f1f5f9", secondary: "#94a3b8" },
  },
  typography: sharedTypography,
  shape: { borderRadius: 10 },
  components: sharedComponents,
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6366f1", light: "#818cf8", dark: "#4f46e5" },
    secondary: { main: "#f43f5e", light: "#fb7185", dark: "#e11d48" },
    success: { main: "#10b981", light: "#34d399", dark: "#059669" },
    warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
  },
  typography: sharedTypography,
  shape: { borderRadius: 10 },
  components: sharedComponents,
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("themeMode") || "dark";
  });

  const toggleTheme = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const theme = useMemo(() => (mode === "dark" ? darkTheme : lightTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
