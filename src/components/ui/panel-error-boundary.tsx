"use client";
import React from "react";

export class PanelErrorBoundary extends React.Component<{ children: React.ReactNode; label: string }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode; label: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error) {
    // Redacted logging — never log credentials/PII (§3 logging)
    console.error(`[PanelError:${this.props.label}]`, error.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[8px] border border-[#E7E5E2] bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">{this.props.label}</div>
          <p className="mt-2 text-sm text-[#C4432E]">This panel couldn&apos;t load. The rest of the dashboard is still available.</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-3 rounded-md border border-[#E7E5E2] px-3 py-1 text-xs hover:bg-[#FAFAF9]">Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}
