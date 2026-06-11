import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Send } from "lucide-react";

export function SubscribeModalDialog({ open, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const handleClose = () => {
    onClose();
    setStatus("idle");
    setEmail(""); setFirstName(""); setLastName("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-foreground">Stay Connected</h3>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="p-8 text-center">
                <p className="font-serif text-lg text-foreground mb-2">Thank you!</p>
                <p className="font-sans text-sm text-muted-foreground">
                  We'll keep you posted on news from the Spurgeon Library.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <p className="font-sans text-sm text-muted-foreground">
                  Subscribe to receive news, articles, and updates from the Spurgeon Library.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md font-sans text-sm bg-background text-foreground focus:outline-none focus:border-primary" />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md font-sans text-sm bg-background text-foreground focus:outline-none focus:border-primary" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md font-sans text-sm bg-background text-foreground focus:outline-none focus:border-primary" />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md font-sans text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
                {status === "error" && (
                  <p className="font-sans text-xs text-destructive text-center">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SubscribeModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/15 text-primary-foreground/60 hover:text-accent hover:border-accent/40 transition-all font-sans text-xs">
        <Mail className="w-3.5 h-3.5" />
        Subscribe to Updates
      </button>
      <SubscribeModalDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
