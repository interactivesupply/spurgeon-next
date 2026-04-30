import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink, ArrowRight } from "lucide-react";
import { decodeEntities } from "@/lib/utils";

const DEFAULTS = {
  eyebrow: "Visit in Person",
  titleTop: "The Spurgeon",
  titleBottom: "Library",
  body1: "Located at Midwestern Baptist Theological Seminary in Kansas City, Missouri, the Spurgeon Library houses one of the world's most significant collections of Spurgeonia — including nearly 6,000 volumes from Spurgeon's personal library, many containing his own handwritten annotations.",
  body2: "Scholars, pastors, students, and Spurgeon enthusiasts are warmly welcomed to visit, research, and experience this treasure firsthand.",
  image: "https://media.base44.com/images/public/699e34d59ad598edd05d1adb/b8039ed92_sp-library2.jpg",
  badgeNumber: "~6,000",
  badgeCaption: "volumes from his\npersonal collection",
  locationLabel: "Location",
  locationLines: "Midwestern Baptist Theological Seminary\n5001 N Oak Trafficway, Kansas City, MO 64118",
  hoursLabel: "Hours",
  hoursLines: "Monday – Friday, 8:00 AM – 5:00 PM\nAppointments recommended for research visits",
  primaryLabel: "Plan Your Visit",
  primaryUrl: "https://www.spurgeon.org/about/spurgeon-library/",
  secondaryLabel: "View on Map",
  secondaryUrl: "https://www.google.com/maps/place/Midwestern+Baptist+Theological+Seminary",
};

function MultilineText({ text }) {
  if (!text) return null;
  return text.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {decodeEntities(line)}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));
}

export default function LibraryVisitSection({ content }) {
  const c = content || {};
  const v = (k) => c[k] || DEFAULTS[k];

  return (
    <section id="visit" className="py-24 md:py-36 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={v('image')}
                alt="The Spurgeon Library"
                className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-primary text-primary-foreground rounded-xl px-5 py-4 shadow-xl">
              <p className="font-serif text-2xl font-bold">{v('badgeNumber')}</p>
              <p className="font-sans text-xs text-primary-foreground/70 mt-0.5">
                <MultilineText text={v('badgeCaption')} />
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}>
            <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
              {decodeEntities(v('eyebrow'))}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              {decodeEntities(v('titleTop'))}
              <br />
              <span className="italic font-normal">{decodeEntities(v('titleBottom'))}</span>
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-8">
              {decodeEntities(v('body1'))}
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed mb-10">
              {decodeEntities(v('body2'))}
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground">{decodeEntities(v('locationLabel'))}</p>
                  <p className="font-sans text-sm text-muted-foreground">
                    <MultilineText text={v('locationLines')} />
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground">{decodeEntities(v('hoursLabel'))}</p>
                  <p className="font-sans text-sm text-muted-foreground">
                    <MultilineText text={v('hoursLines')} />
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={v('primaryUrl')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm font-medium hover:bg-primary/90 transition-colors group">
                {decodeEntities(v('primaryLabel'))}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href={v('secondaryUrl')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-border text-foreground rounded-lg font-sans text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors">
                <ExternalLink className="w-4 h-4" />
                {decodeEntities(v('secondaryLabel'))}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
