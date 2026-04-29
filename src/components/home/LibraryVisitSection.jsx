import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink, ArrowRight } from "lucide-react";

export default function LibraryVisitSection() {
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
                src="https://media.base44.com/images/public/699e34d59ad598edd05d1adb/b8039ed92_sp-library2.jpg"
                alt="The Spurgeon Library"
                className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-primary text-primary-foreground rounded-xl px-5 py-4 shadow-xl">
              <p className="font-serif text-2xl font-bold">~6,000</p>
              <p className="font-sans text-xs text-primary-foreground/70 mt-0.5">
                volumes from his<br />personal collection
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}>
            <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
              Visit in Person
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              The Spurgeon
              <br />
              <span className="italic font-normal">Library</span>
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-8">
              Located at Midwestern Baptist Theological Seminary in Kansas City, Missouri,
              the Spurgeon Library houses one of the world's most significant collections
              of Spurgeonia — including nearly 6,000 volumes from Spurgeon's personal
              library, many containing his own handwritten annotations.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed mb-10">
              Scholars, pastors, students, and Spurgeon enthusiasts are warmly welcomed
              to visit, research, and experience this treasure firsthand.
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground">Location</p>
                  <p className="font-sans text-sm text-muted-foreground">
                    Midwestern Baptist Theological Seminary<br />
                    5001 N Oak Trafficway, Kansas City, MO 64118
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground">Hours</p>
                  <p className="font-sans text-sm text-muted-foreground">
                    Monday – Friday, 8:00 AM – 5:00 PM<br />
                    Appointments recommended for research visits
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.spurgeon.org/about/spurgeon-library/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm font-medium hover:bg-primary/90 transition-colors group">
                Plan Your Visit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://www.google.com/maps/place/Midwestern+Baptist+Theological+Seminary"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-border text-foreground rounded-lg font-sans text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors">
                <ExternalLink className="w-4 h-4" />
                View on Map
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
