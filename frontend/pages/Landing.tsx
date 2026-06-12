import { useNavigate, Link } from "react-router-dom";
import { Card, CardBody } from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero" style={{
        marginTop: -80,
        padding: "160px 24px 80px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            fontWeight: 700,
            fontFamily: '"Space Grotesk", sans-serif',
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 24px",
            color: "var(--text)",
          }}>
            Know your audience.<br />
            <span className="hero-accent">Own the stage.</span>
          </h1>
          <p style={{
            fontSize: "1.15rem",
            color: "var(--muted)",
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}>
            CrowdShift turns raw registration data into a live audience brief —
            so speakers know exactly who's in the room and what they need.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <span className="cta-btn">
              <Button themeColor="primary" size="large" rounded="full" onClick={() => navigate("/login")} style={{ boxShadow: "none" }}>
                See your room →
              </Button>
            </span>
            <Button
              themeColor="secondary"
              fillMode="outline"
              size="large"
              rounded="full"
              onClick={() => window.open("https://youtu.be/LepsNZo-VHA", "_blank")}
            >
              How it works
            </Button>
          </div>
        </div>
      </section>

    
      <section id="privacy" style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "80px 24px",
      }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "1.8rem",
          fontWeight: 700,
          fontFamily: '"Space Grotesk", sans-serif',
          marginBottom: 48,
          color: "var(--text)",
        }}>
          Privacy by design
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}>
          {[
            {
              title: "Speakers",
              body: "See aggregate demographics for their talk — age ranges, tech stacks, roles. Never individual attendee PII.",
              highlighted: true,
            },
            {
              title: "Organizers",
              body: "Full attendee data for event planning and marketing. Exportable, filterable, sortable.",
            },
            {
              title: "Sponsors",
              body: "Privacy-safe aggregates only. Tech stacks, company sizes, roles — no names, no emails, no ticket IDs.",
              featured: true,
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="step-card"
              style={{
                position: "relative",
                border: item.highlighted ? "2px solid var(--accent)" : undefined,
              }}
            >
              {item.featured && (
                <span style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  background: "var(--accent)",
                  color: "var(--cta-text)",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: '"Space Grotesk", sans-serif',
                  padding: "2px 10px",
                  borderRadius: 999,
                }}>
                  Privacy-safe
                </span>
              )}
              <CardBody>
                <h3 style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  fontFamily: '"Space Grotesk", sans-serif',
                  margin: "0 0 8px",
                  color: "inherit",
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                  {item.body}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section style={{
        textAlign: "center",
        padding: "80px 24px 100px",
      }}>
        <h2 style={{
          fontSize: "1.8rem",
          fontWeight: 700,
          fontFamily: '"Space Grotesk", sans-serif',
          marginBottom: 16,
          color: "var(--text)",
        }}>
          Ready to know your room?
        </h2>
        <p style={{
          fontSize: "1.05rem",
          color: "var(--muted)",
          marginBottom: 32,
        }}>
          See what CrowdShift tells a speaker before they pick up the mic.
        </p>
        <span className="cta-btn" style={{ display: "inline-block", borderRadius: "9999px" }}>
          <Button themeColor="primary" size="large" rounded="full" onClick={() => navigate("/login")} style={{ boxShadow: "none" }}>
            See your room →
          </Button>
        </span>
      </section>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px",
        textAlign: "center",
        fontSize: "0.8rem",
        color: "var(--muted)",
      }}>
        <div>
          <Link to="/login" style={{ color: "var(--muted)" }}>Demo login</Link>
          <span style={{ margin: "0 12px" }}>·</span>
          <Link to="/attendee" style={{ color: "var(--muted)" }}>Submit a question</Link>
          <span style={{ margin: "0 12px" }}>·</span>
          <a href="https://github.com/alxhdd/CrowdShift" target="_blank" rel="noopener noreferrer" style={{ color: "var(--muted)" }}>GitHub</a>
        </div>
        <div style={{ marginTop: 8 }}>
          Built for the <a href="https://www.gitnation.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-text)" }}>Progress x GitNation Hackathon 2026</a>
          <span style={{ margin: "0 6px" }}>by</span>
          <a href="https://alxhdd.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-text)" }}>alxhdd</a>
        </div>
      </footer>
    </div>
  );
}
