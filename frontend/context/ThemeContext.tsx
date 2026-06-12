import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const THEME_VARS: Record<ThemeMode, Record<string, string>> = {
  dark: {
    "--bg": "#121214",
    "--text": "#f7f5f2",
    "--text-muted": "rgba(247, 245, 242, 0.62)",

    "--accent": "#f5eb7c",
    "--accent-from": "#f5eb7c",
    "--accent-to": "#f0b35a",
    "--hero-accent-from": "#f5eb7c",
    "--hero-accent-to": "#eb9783",
    "--accent-text": "#f5eb7c",
    "--accent2": "#eb9783",

    "--glow-1": "rgba(245, 235, 124, 0.14)",
    "--glow-2": "rgba(132, 94, 247, 0.08)",
    "--grid-line": "rgba(255, 255, 255, 0.025)",
    "--nav-border": "rgba(255, 255, 255, 0.05)",

    "--card-bg": "#3a3a41",
    "--card-bg-alt": "#c7c4c2",
    "--card-bg-accent": "#f5eb7c",
    "--card-text-alt": "#242428",
    "--card-text-accent": "#242428",
    "--card-border": "rgba(255, 255, 255, 0.07)",
    "--card-accent": "#c7c4c2",

    "--border": "#4a4a51",
    "--muted": "#9a9996",
    "--tag-bg": "rgba(245, 235, 124, 0.15)",
    "--tag-text": "#f5eb7c",
    "--stat-bg": "#2e2e33",
    "--shift-bg": "rgba(245, 235, 124, 0.1)",
    "--shift-border": "#f5eb7c",
    "--shift-text": "#f5eb7c",
    "--input-bg": "#3a3a41",
    "--input-border": "#4a4a51",
    "--table-stripe": "#2e2e33",

    "--cta-bg": "#f5eb7c",
    "--cta-text": "#242428",
    "--cta-glow": "rgba(245, 235, 124, 0.30)",
  },
  light: {
    "--bg": "#faf8f3",
    "--text": "#1a1a1d",
    "--text-muted": "rgba(26, 26, 29, 0.62)",

    "--accent": "#eb9783",
    "--accent-from": "#d4684a",
    "--accent-to": "#b94e33",
    "--hero-accent-from": "#eb9783",
    "--hero-accent-to": "#f5eb7c",
    "--accent-text": "#b94e33",
    "--accent2": "#f5eb7c",

    "--glow-1": "rgba(235, 151, 131, 0.20)",
    "--glow-2": "rgba(132, 94, 247, 0.06)",
    "--grid-line": "rgba(26, 26, 29, 0.045)",
    "--nav-border": "rgba(26, 26, 29, 0.06)",

    "--card-bg": "#ffffff",
    "--card-bg-alt": "#c7c4c2",
    "--card-bg-accent": "#242428",
    "--card-text-alt": "#242428",
    "--card-text-accent": "#faf8f3",
    "--card-border": "rgba(26, 26, 29, 0.08)",
    "--card-accent": "#c7c4c2",

    "--border": "#d9d7d4",
    "--muted": "rgba(26, 26, 29, 0.55)",
    "--tag-bg": "rgba(235, 151, 131, 0.12)",
    "--tag-text": "#b94e33",
    "--stat-bg": "#f0eeea",
    "--shift-bg": "rgba(235, 151, 131, 0.12)",
    "--shift-border": "#eb9783",
    "--shift-text": "#b94e33",
    "--input-bg": "#ffffff",
    "--input-border": "rgba(26, 26, 29, 0.15)",
    "--table-stripe": "#f0eeea",

    "--cta-bg": "#eb9783",
    "--cta-text": "#3d150b",
    "--cta-glow": "rgba(235, 151, 131, 0.50)",
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("crowdshift-theme");
    return stored === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const vars = THEME_VARS[mode];
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    localStorage.setItem("crowdshift-theme", mode);

    const darkLink = document.getElementById("kendo-theme-dark") as HTMLLinkElement | null;
    const lightLink = document.getElementById("kendo-theme-light") as HTMLLinkElement | null;
    if (darkLink) darkLink.disabled = mode !== "dark";
    if (lightLink) lightLink.disabled = mode !== "light";

    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = mode === "dark" ? "/favicon-dark.png" : "/favicon-light.png";
    }
  }, [mode]);

  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
