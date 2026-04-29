import React from "react";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import SubscribeModal from "@/components/home/SubscribeModal";

export default function FooterSection() {
  return (
    <div>
      <footer className="bg-foreground text-primary-foreground/70 pt-16 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <img
                  src="https://media.base44.com/images/public/699e34d59ad598edd05d1adb/7241fdd9e_signature-onlyAsset12x.png"
                  alt="C.H. Spurgeon signature"
                  className="h-20 w-auto object-contain opacity-80" />
              </div>
              <p className="font-sans text-sm leading-relaxed text-primary-foreground/50 max-w-sm">
                Making visible the life, legacy, and library of Charles Haddon
                Spurgeon. A ministry of Midwestern Baptist Theological Seminary.
              </p>
              <a
                href="https://www.mbts.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full border border-primary-foreground/15 text-primary-foreground/60 hover:text-accent hover:border-accent/40 transition-all font-sans text-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                Pursue an M.Div or Doctorate at MBTS.edu
              </a>
            </div>

            <div>
              <h4 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/40 mb-4">
                Explore
              </h4>
              <ul className="space-y-2.5 font-sans text-sm">
                <li><Link href={ROUTES.Home} className="hover:text-accent transition-colors">Home</Link></li>
                <li><Link href={ROUTES.Search} className="hover:text-accent transition-colors">Search Library</Link></li>
                <li><Link href={ROUTES.About} className="hover:text-accent transition-colors">About Spurgeon</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/40 mb-4">
                Connected
              </h4>
              <ul className="space-y-2.5 font-sans text-sm mb-5">
                <li><a href="https://www.mbts.edu/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Midwestern Seminary</a></li>
                <li><a href="https://spurgeoncollege.com/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Spurgeon College</a></li>
                <li><a href="https://ftc.co/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">For the Church</a></li>
              </ul>
              <SubscribeModal />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-sans text-xs text-primary-foreground/30">
              © {new Date().getFullYear()} The Spurgeon Center. All rights reserved.
            </p>
            <p className="font-sans text-xs text-primary-foreground/30 italic">
              "I have a great need for Christ; I have a great Christ for my need."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
