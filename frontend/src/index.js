import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", color: "#f5f2eb", background: "#0f0e0e", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h2 style={{ color: "#d4af37" }}>Terjadi Kendala Memuat Undangan</h2>
          <p style={{ color: "#aaa" }}>Pesan Error:</p>
          <pre style={{ color: "#ff6b6b", background: "#1a1818", padding: 15, borderRadius: 8, whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ color: "#777", fontSize: 12, overflowX: "auto" }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
