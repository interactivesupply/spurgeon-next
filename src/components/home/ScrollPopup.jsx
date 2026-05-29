import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, CalendarDays, Mail, Bell } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function ScrollPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-foreground cursor-pointer" onClick={() => setCollapsed(c => !c)}>
            <span className="font-serif text-sm font-semibold text-primary-foreground">
              Connect With Us
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setCollapsed(c => !c); }}
                className="text-primary-foreground/50 hover:text-primary-foreground transition-colors"
                title={collapsed ? "Expand" : "Collapse"}>
                <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
                className="text-primary-foreground/50 hover:text-primary-foreground transition-colors"
                title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <div className="p-4 space-y-2">
                  <Link
                    href={ROUTES.Library + "#visit"}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary transition-all group">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-foreground">Schedule a Visit</p>
                      <p className="font-sans text-xs text-muted-foreground">Tour the Spurgeon Library</p>
                    </div>
                  </Link>

                  <a
                    href="mailto:spurgeon@mbts.edu"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary transition-all group">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-foreground">Contact Us</p>
                      <p className="font-sans text-xs text-muted-foreground">Get in touch with the Library</p>
                    </div>
                  </a>

                  <Link
                    href={ROUTES.MorningAndEvening + "#subscribe"}
                    className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-foreground">Subscribe to Updates</p>
                      <p className="font-sans text-xs text-muted-foreground">Daily devotionals & news</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
