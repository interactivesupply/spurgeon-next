import React, { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";

export default function DevotionalSubscribeBox({ devotional, periods = ["morning", "evening"] }) {
  const [email, setEmail] = useState("");
  const [period, setPeriod] = useState(periods.includes("both") ? "both" : periods[0]);
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe-devotional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, devotional, period }),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-4">
        <Check className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="font-sans text-sm font-medium text-foreground">You're subscribed!</p>
          <p className="font-sans text-xs text-muted-foreground">Check your inbox for a confirmation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-4 h-4 text-accent" />
        <span className="font-sans text-sm font-semibold text-foreground">Subscribe for daily delivery</span>
      </div>
      <p className="font-sans text-xs text-muted-foreground mb-4">
        Receive today's entry in your inbox each day.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {periods.length > 1 && (
          <div className="flex gap-2">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-colors capitalize ${
                  period === p
                    ? "bg-accent text-accent-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-card border border-border rounded-lg px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-all" />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-sans text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5">
            {status === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Subscribe
          </button>
        </div>
        {status === "error" && (
          <p className="font-sans text-xs text-destructive">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  );
}
