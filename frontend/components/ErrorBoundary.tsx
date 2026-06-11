import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: any }> {
  state = { error: null };
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, background: "#fff", border: "1px solid red", borderRadius: 8, margin: 16 }}>
          <h3 style={{ color: "red" }}>Error</h3>
          <pre style={{ fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>{String(this.state.error?.message || this.state.error)}</pre>
          <pre style={{ fontSize: "0.75rem", color: "#666", whiteSpace: "pre-wrap" }}>{this.state.error?.stack?.slice(0, 500)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
