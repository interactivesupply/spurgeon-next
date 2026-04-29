import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Smartphone } from "lucide-react";

export default function TourQRModal({ open, onClose, stop }) {
  if (!stop) return null;

  // Generate a URL for this specific stop. Guard against SSR (no window).
  const stopUrl = typeof window !== "undefined"
    ? `${window.location.origin}/library/digital-tour?stop=${stop.id}`
    : `/library/digital-tour?stop=${stop.id}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(stopUrl)}&color=3d1a0f&bgcolor=f9f5f0`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-5 h-5 text-primary" />
            </div>

            <h3 className="font-serif text-xl font-bold text-foreground mb-1">
              Stop {stop.id} — {stop.title}
            </h3>
            <p className="font-sans text-xs text-muted-foreground mb-6">
              Scan this code in the library to open this stop on your device.
            </p>

            <div className="bg-background border border-border rounded-xl p-4 inline-block mb-6">
              <img
                src={qrApiUrl}
                alt={`QR code for Stop ${stop.id}: ${stop.title}`}
                className="w-[180px] h-[180px]"
              />
            </div>

            <div className="flex items-center gap-2 justify-center text-muted-foreground">
              <Smartphone className="w-3.5 h-3.5" />
              <p className="font-sans text-xs">
                Or visit <span className="text-primary font-medium">spurgeon.org</span> and navigate to the Digital Tour
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}