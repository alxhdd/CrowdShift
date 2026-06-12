import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TextBox,
  TextArea,
} from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Button } from "@progress/kendo-react-buttons";
import { api } from "../utils/api";

interface RegisteredTalk {
  id: number;
  title: string;
  track: string;
}

export default function AttendeeForm() {
  const [step, setStep] = useState<"lookup" | "form">("lookup");
  const [name, setName] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [talks, setTalks] = useState<RegisteredTalk[]>([]);
  const [talkId, setTalkId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setError("");
    if (!name.trim() || !ticketId.trim()) {
      setError("Both name and ticket ID are required.");
      return;
    }
    setLoading(true);
    try {
      const result = await api.lookupAttendee(ticketId.trim());
      setTalks(result.registered_talks);
      setStep("form");
    } catch (e: any) {
      setError(e.message || "Invalid ticket ID.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    if (!talkId || !question.trim()) {
      setError("Please select a talk and enter your question.");
      return;
    }
    setLoading(true);
    try {
      await api.submitQuestion(ticketId, talkId, question);
      setMessage("Question submitted! The speaker will see it in their dashboard.");
      setTalkId(null);
      setQuestion("");
    } catch (e: any) {
      setError(e.message || "Failed to submit question.");
    }
    setLoading(false);
  };

  const handleBack = () => {
    setStep("lookup");
    setError("");
  };

  if (step === "lookup") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div className="panel-card" style={{ width: 400 }}>
          <h1 style={{ textAlign: "center", margin: "0 0 4px", fontSize: "1.5rem", color: "var(--text)" }}>
            Ask a Question
          </h1>
          <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 20, fontSize: "0.9rem" }}>
            Identify yourself to get started
          </p>

          <div style={{
            border: "1px dashed var(--border)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            background: "var(--stat-bg)",
          }}>
            <p style={{ margin: "0 0 6px", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)" }}>
              Demo credentials
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.85rem", color: "var(--text)" }}>
              <span><strong>Jeff Owens</strong> — TKT-0018</span>
              <span><strong>Katie Suarez</strong> — TKT-0082</span>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
              Submit a question and it will appear live in the speaker's dashboard.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                Name
              </label>
              <TextBox
                value={name}
                onChange={(e) => setName(String(e.value ?? ""))}
                placeholder="Your full name"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                Ticket ID
              </label>
              <TextBox
                value={ticketId}
                onChange={(e) => setTicketId(String(e.value ?? ""))}
                placeholder="e.g. TKT-0042"
                style={{ width: "100%" }}
              />
            </div>

            {error && (
              <div style={{ color: "#d93025", fontSize: "0.85rem" }}>{error}</div>
            )}

            <Button
              themeColor="primary"
              onClick={handleContinue}
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Checking..." : "Continue"}
            </Button>

            <p style={{ textAlign: "center", margin: 0 }}>
              <Link to="/">Back to login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 16px" }}>
        <div className="panel-card">
          <h1 style={{ textAlign: "center", margin: "0 0 4px", fontSize: "1.5rem", color: "var(--text)" }}>
            Ask a Question
          </h1>
          <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 28, fontSize: "0.9rem" }}>
            Hi {name}! What would you like to ask?
          </p>

          {talks.length === 0 ? (
            <>
              <p style={{ textAlign: "center", color: "var(--muted)" }}>
                You are not registered for any talks yet.
              </p>
              <p style={{ textAlign: "center", marginTop: 24 }}>
                <Button onClick={handleBack}>Go Back</Button>
              </p>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                  Select Talk
                </label>
                <DropDownList
                  data={talks}
                  textField="title"
                  dataItemKey="id"
                  value={talks.find((t) => t.id === talkId) || null}
                  onChange={(e) => setTalkId(e.value?.id ?? null)}
                  style={{ width: "100%" }}
                  defaultItem={{ title: "Select a talk...", id: 0 }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                  Your Question
                </label>
                <TextArea
                  value={question}
                  onChange={(e) => setQuestion(e.value)}
                  rows={3}
                  placeholder="What would you like to ask the speaker?"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              {error && (
                <div style={{ color: "#d93025", fontSize: "0.85rem" }}>{error}</div>
              )}

              {message && (
                <div style={{
                  color: "#188038",
                  fontSize: "0.85rem",
                  background: "rgba(24,128,56,0.1)",
                  padding: 12,
                  borderRadius: 6,
                }}>
                  {message}
                </div>
              )}

              <Button
                themeColor="primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: "100%" }}
              >
                {loading ? "Submitting..." : "Submit Question"}
              </Button>

              <p style={{ textAlign: "center", margin: 0 }}>
                <button
                  onClick={handleBack}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Not {name}? Go back
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
