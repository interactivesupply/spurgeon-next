import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { MapPin, Clock, Phone, Mail, ArrowRight, BookOpen, Compass, CalendarDays, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import FooterSection from "@/components/home/FooterSection";
import LibraryCarousel from "@/components/library/LibraryCarousel";
import LibraryStaff from "@/components/library/LibraryStaff";

export default function Library() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://media.base44.com/images/public/699e34d59ad598edd05d1adb/b8039ed92_sp-library2.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-5 h-5 text-accent" />
                <span className="font-sans text-sm text-primary-foreground/50 uppercase tracking-widest">
                  Midwestern Baptist Theological Seminary
                </span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                The Spurgeon
                <br />
                <span className="italic font-normal text-accent">Library & Center</span>
              </h1>
              <p className="font-sans text-lg text-primary-foreground/60 max-w-xl leading-relaxed mb-10">
                A physical home for Spurgeon's legacy — housing nearly 6,000 volumes from his personal library,
                and open to all who wish to study the life and ministry of the Prince of Preachers.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#visit"
                  onClick={e => { e.preventDefault(); document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-full font-sans text-sm font-semibold hover:bg-accent/90 transition-colors">
                  <CalendarDays className="w-4 h-4" />
                  Plan Your Visit
                </a>
                <Link
                  href={ROUTES.DigitalTour}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary-foreground/20 text-primary-foreground/80 hover:text-primary-foreground hover:border-primary-foreground/40 font-sans text-sm font-medium transition-all">
                  <Compass className="w-4 h-4" />
                  Take the Digital Tour
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <LibraryCarousel />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10">
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">Overview</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">A Tour of the Library</h2>
            <p className="font-sans text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
              Watch this brief introduction to the Spurgeon Center and Library at Midwestern Baptist Theological Seminary.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden aspect-video shadow-2xl border border-border">
            <a
              href="https://www.youtube.com/watch?v=1y0MLKjHln0"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full rounded-2xl overflow-hidden relative group">
              <img
                src="https://img.youtube.com/vi/1y0MLKjHln0/maxresdefault.jpg"
                alt="The Spurgeon Library at MBTS"
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 text-foreground" />
                </div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>

      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-5">
                <Compass className="w-3.5 h-3.5 text-accent" />
                <span className="font-sans text-xs text-accent font-medium uppercase tracking-wider">Self-Guided Tour</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">The Digital Gallery Tour</h2>
              <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                The Spurgeon Library features a gallery of original paintings depicting key moments in Spurgeon's life and ministry.
                Each painting has a QR code — scan it in person or explore the full gallery here online with detailed commentary on each work.
              </p>
              <Link
                href={ROUTES.DigitalTour}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-sans text-sm font-semibold hover:bg-primary/90 transition-colors">
                Explore the Gallery
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-3">
              {[
                { num: "01", title: "The Conversion" },
                { num: "02", title: "New Park Street" },
                { num: "03", title: "The Tabernacle" },
                { num: "04", title: "The College" },
                { num: "05", title: "The Orphanage" },
                { num: "06", title: "The Legacy" },
              ].map((stop) => (
                <Link
                  key={stop.num}
                  href={ROUTES.DigitalTour + `?stop=${stop.num}`}
                  className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group">
                  <p className="font-sans text-xs text-muted-foreground mb-1">Stop {stop.num}</p>
                  <p className="font-serif text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {stop.title}
                  </p>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <LibraryStaff />

      <div id="visit" className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">Come In Person</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Plan Your Visit</h2>
          <p className="font-sans text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
            The Spurgeon Library is located on the campus of Midwestern Baptist Theological Seminary in Kansas City, Missouri.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Location</h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Midwestern Baptist Theological Seminary<br />
              5001 N Oak Trafficway<br />
              Kansas City, MO 64118
            </p>
            <a
              href="https://maps.google.com/?q=Midwestern+Baptist+Theological+Seminary+Kansas+City+MO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 font-sans text-sm text-primary hover:underline">
              Get Directions <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Hours</h3>
            <ul className="font-sans text-sm text-muted-foreground space-y-2">
              <li className="flex justify-between"><span>Monday – Friday</span><span className="text-foreground font-medium">8am – 5pm</span></li>
              <li className="flex justify-between"><span>Saturday</span><span className="text-foreground font-medium">By Appointment</span></li>
              <li className="flex justify-between"><span>Sunday</span><span className="text-muted-foreground">Closed</span></li>
            </ul>
            <p className="font-sans text-xs text-muted-foreground/70 mt-4 italic">
              Hours may vary during seminary holidays and events.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Contact</h3>
            <ul className="font-sans text-sm text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+18164142000" className="hover:text-primary transition-colors">(816) 414-2000</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:spurgeoncenter@mbts.edu" className="hover:text-primary transition-colors">spurgeoncenter@mbts.edu</a>
              </li>
            </ul>
            <a
              href="https://www.mbts.edu/academics/the-spurgeon-library/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-5 font-sans text-sm text-primary hover:underline">
              Visit MBTS Website <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 rounded-2xl overflow-hidden border border-border shadow-md"
          style={{ height: 340 }}>
          <iframe
            title="MBTS Campus Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3093.0!2d-94.57845!3d39.21958!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87c0f0e0f0e0f0e0%3A0x0!2s5001%20N%20Oak%20Trafficway%2C%20Kansas%20City%2C%20MO%2064118!5e0!3m2!1sen!2sus!4v1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87c0f77c5e3b3c07%3A0x9e1f5f7a3e5e5e5e!2sMidwestern%20Baptist%20Theological%20Seminary!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy" />
        </motion.div>
      </div>

      <FooterSection />
    </div>
  );
}
