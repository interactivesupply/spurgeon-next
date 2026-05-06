import {
  BookMarked, BookOpen, Calendar, ChevronRight, FileText, GraduationCap,
  Library, MicVocal, Newspaper, Scroll, Star, Video,
  type LucideIcon,
} from 'lucide-react';

/**
 * Map of Lucide icon names → components, used by editor-driven nav fields
 * that store an icon as a string. Keep this small and curated — only icons
 * editors are likely to pick from. Unknown names fall back to a sensible
 * default at the call site.
 */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  BookMarked,
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  GraduationCap,
  Library,
  MicVocal,
  Newspaper,
  Scroll,
  Star,
  Video,
};

/** Look up an icon by name, falling back to BookOpen if unknown/empty. */
export function iconFor(name: string | null | undefined): LucideIcon {
  return (name && ICON_REGISTRY[name]) || BookOpen;
}
