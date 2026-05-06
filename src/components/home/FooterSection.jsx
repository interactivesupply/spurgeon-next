import React from "react";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { decodeEntities } from "@/lib/utils";
import SubscribeModal from "@/components/home/SubscribeModal";

const DEFAULTS = {
  signatureImage: "https://media.base44.com/images/public/699e34d59ad598edd05d1adb/7241fdd9e_signature-onlyAsset12x.png",
  aboutText: "Making visible the life, legacy, and library of Charles Haddon Spurgeon. A ministry of Midwestern Baptist Theological Seminary.",
  quote: "I have a great need for Christ; I have a great Christ for my need.",
  quoteAuthor: "Charles H. Spurgeon",
  mbtsPursueLabel: "Pursue an M.Div or Doctorate at MBTS.edu",
  mbtsPursueUrl: "https://www.mbts.edu/",
};

// Fallback footer columns when the editor-managed `footer_columns` field is
// empty (fresh installs or before someone seeds defaults).
const FALLBACK_FOOTER_COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home',           url: '/',       newTab: false },
      { label: 'Search Library', url: '/search', newTab: false },
      { label: 'About Spurgeon', url: '/about',  newTab: false },
    ],
  },
  {
    heading: 'Connected',
    links: [
      { label: 'Midwestern Seminary', url: 'https://www.mbts.edu/',         newTab: true },
      { label: 'Spurgeon College',    url: 'https://spurgeoncollege.com/', newTab: true },
      { label: 'For the Church',      url: 'https://ftc.co/',              newTab: true },
    ],
  },
];

function FooterLink({ link }) {
  const isExternal = /^https?:\/\//i.test(link.url);
  if (isExternal || link.newTab) {
    return (
      <a
        href={link.url}
        target={link.newTab ? '_blank' : undefined}
        rel={link.newTab ? 'noopener noreferrer' : undefined}
        className="hover:text-accent transition-colors">
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.url} className="hover:text-accent transition-colors">
      {link.label}
    </Link>
  );
}

export default function FooterSection({ settings, footerColumns }) {
  const s = settings || {};
  const v = (k) => s[k] || DEFAULTS[k];

  // Editor-managed columns first, hardcoded fallback otherwise. Last column
  // always carries the SubscribeModal (a fixed component, not editor content).
  const columns = (footerColumns && footerColumns.length ? footerColumns : FALLBACK_FOOTER_COLUMNS);

  return (
    <div>
      <footer className="bg-foreground text-primary-foreground/70 pt-16 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <img
                  src={v('signatureImage')}
                  alt="C.H. Spurgeon signature"
                  className="h-20 w-auto object-contain opacity-80" />
              </div>
              <p className="font-sans text-sm leading-relaxed text-primary-foreground/50 max-w-sm">
                {decodeEntities(v('aboutText'))}
              </p>
              <a
                href={v('mbtsPursueUrl')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full border border-primary-foreground/15 text-primary-foreground/60 hover:text-accent hover:border-accent/40 transition-all font-sans text-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                {decodeEntities(v('mbtsPursueLabel'))}
              </a>
            </div>

            {columns.map((col, i) => (
              <div key={col.heading + i}>
                <h4 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/40 mb-4">
                  {col.heading}
                </h4>
                <ul className="space-y-2.5 font-sans text-sm mb-5">
                  {(col.links || []).map((link, j) => (
                    <li key={link.url + j}><FooterLink link={link} /></li>
                  ))}
                </ul>
                {/* Subscribe modal lives in the last column (editorial choice;
                    the columns themselves don't carry CTAs). */}
                {i === columns.length - 1 && <SubscribeModal />}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-sans text-xs text-primary-foreground/30">
              © {new Date().getFullYear()} The Spurgeon Center. All rights reserved.
            </p>
            <p className="font-sans text-xs text-primary-foreground/30 italic">
              "{decodeEntities(v('quote'))}"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
