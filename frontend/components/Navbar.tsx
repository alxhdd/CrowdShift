import { useLocation, useNavigate } from "react-router-dom";
import { AppBar, AppBarSection, AppBarSpacer } from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";
import { useTheme } from "../context/ThemeContext";

function Logo() {
  const { mode } = useTheme();
  const logoSrc = mode === "dark" ? "/logo-dark.png" : "/logo-light.png";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: '"Space Grotesk", sans-serif', fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>
      <img src={logoSrc} alt="CrowdShift" height={80} style={{ display: "block", mixBlendMode: "screen" }} />
      Crowd<span style={{ color: "var(--accent)" }}>Shift</span>
    </span>
  );
}

function ThemeToggle() {
  const { mode, toggle } = useTheme();
  return (
    <Button fillMode="flat" onClick={toggle} title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}>
      {mode === "dark" ? "☀" : "☾"}
    </Button>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";

  return (
    <AppBar
      className="nav-glass"
      style={{
        borderBottom: "none",
        height: 80,
      }}
    >
      <AppBarSection>
        <span
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <Logo />
        </span>
      </AppBarSection>
      <AppBarSpacer />

      <AppBarSection style={{ gap: 4 }}>
        {isLanding && (
          <>
            <span className="nav-hide-mobile">
              <Button fillMode="flat" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                How it works
              </Button>
            </span>
            <span className="nav-hide-mobile">
              <Button fillMode="flat" onClick={() => document.getElementById("privacy")?.scrollIntoView({ behavior: "smooth" })}>
                Privacy
              </Button>
            </span>
            <span className="nav-hide-mobile">
              <Button themeColor="primary" rounded="full" onClick={() => navigate("/login")}>
                See your room →
              </Button>
            </span>
          </>
        )}
        {!isLanding && !isDashboard && (
          <Button fillMode="flat" onClick={() => navigate("/")}>
            ← Home
          </Button>
        )}
        {isDashboard && (
          <Button fillMode="flat" onClick={() => navigate("/")}>
            Logout
          </Button>
        )}
        <ThemeToggle />
      </AppBarSection>
    </AppBar>
  );
}
