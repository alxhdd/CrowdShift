import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
        background: "#f5f5f5",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: "40px 36px",
          width: 400,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}>
          <h1 style={{ textAlign: "center", margin: "0 0 4px", fontSize: "1.5rem" }}>
            Ask a Question
          </h1>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 28, fontSize: "0.9rem" }}>
            Identify yourself to get started
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600 }}>
                Name
              </label>
              <TextBox
                value={name}
                onChange={(e) => setName(e.value)}
                placeholder="Your full name"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600 }}>
                Ticket ID
              </label>
              <TextBox
                value={ticketId}
                onChange={(e) => setTicketId(e.value)}
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
              <a href="/" style={{ color: "#666", fontSize: "0.85rem" }}>
                Back to login
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 16px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: "40px 36px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}>
          <h1 style={{ textAlign: "center", margin: "0 0 4px", fontSize: "1.5rem" }}>
            Ask a Question
          </h1>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 28, fontSize: "0.9rem" }}>
            Hi {name}! What would you like to ask?
          </p>

          {talks.length === 0 ? (
            <>
              <p style={{ textAlign: "center", color: "#999" }}>
                You are not registered for any talks yet.
              </p>
              <p style={{ textAlign: "center", marginTop: 24 }}>
                <Button onClick={handleBack}>Go Back</Button>
              </p>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600 }}>
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
                <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600 }}>
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
                  background: "#e6f4ea",
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
                    color: "#666",
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
