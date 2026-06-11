import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextBox,
  TextArea,
  DropDownList,
} from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { api } from "../utils/api";
import { TalkSummary } from "../types";

export default function AttendeeForm() {
  const navigate = useNavigate();
  const [talks, setTalks] = useState<TalkSummary[]>([]);
  const [ticketId, setTicketId] = useState("");
  const [talkId, setTalkId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.talks().then((data) => setTalks(data));
  }, []);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    if (!ticketId.trim() || !talkId || !question.trim()) {
      setError("All fields are required.");
      return;
    }
    try {
      await api.submitQuestion(ticketId, talkId, question);
      setMessage("Question submitted! The speaker will see it in their dashboard.");
      setTicketId("");
      setTalkId(null);
      setQuestion("");
    } catch (e: any) {
      setError(e.message || "Failed to submit question.");
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: "0 16px" }}>
      <h1 style={{ textAlign: "center", marginBottom: 4 }}>Ask a Question</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 32 }}>
        Submit a question for a talk you're attending
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: "0.85rem", fontWeight: 600 }}>
            Talk
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
          <div
            style={{
              color: "#188038",
              fontSize: "0.85rem",
              background: "#e6f4ea",
              padding: 12,
              borderRadius: 6,
            }}
          >
            {message}
          </div>
        )}

        <Button themeColor="primary" onClick={handleSubmit}>
          Submit Question
        </Button>

        <p style={{ textAlign: "center", marginTop: 8 }}>
          <a href="/" style={{ color: "#666", fontSize: "0.85rem" }}>
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}
