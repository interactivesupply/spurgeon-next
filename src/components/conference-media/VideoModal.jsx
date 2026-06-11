import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Translate a YouTube or Vimeo watch URL into a player-embed URL suitable
 * for an <iframe src>. Returns null for unsupported / empty inputs.
 */
function toEmbedSrc(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  // Capture optional private hash (e.g. vimeo.com/123456789/abc123def456)
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?/);
  if (vm) {
    const hashParam = vm[2] ? `&h=${vm[2]}` : '';
    return `https://player.vimeo.com/video/${vm[1]}?autoplay=1${hashParam}`;
  }
  return null;
}

/**
 * Modal that loads a YouTube or Vimeo embed when opened. Pure client
 * component — open state is owned by the parent. Closes on backdrop
 * click, X button, or Esc. Pass either a raw `videoUrl` (preferred) or
 * a `youtubeId` (legacy callers).
 */
export default function VideoModal({ open, onClose, videoUrl = null, youtubeId = null, title = "" }) {
  const embedSrc = videoUrl
    ? toEmbedSrc(videoUrl)
    : (youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0` : null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    // Lock body scroll while modal is open so the viewer focuses on the player.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title ? `Video: ${title}` : "Video player"}>
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close video"
              className="absolute -top-12 right-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            {embedSrc && (
              <iframe
                src={embedSrc}
                title={title || "Video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-xl shadow-2xl bg-black" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
