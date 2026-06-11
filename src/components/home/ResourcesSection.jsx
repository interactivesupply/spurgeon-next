import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Scroll, PenTool, GraduationCap, Library, Users, BookMarked, Newspaper } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { decodeEntities } from "@/lib/utils";

const ICONS = { BookOpen, Scroll, PenTool, GraduationCap, Library, Users, BookMarked, Newspaper };

const DEFAULTS = {
  eyebrow: "Explore the Archive",
  heading: "A Living Library",
  intro: "The most comprehensive collection of Spurgeon's works, digitized and freely available to study, search, and share.",
  items: [
    { icon: "Scroll", title: "Sermons", description: "Over 3,500 sermons preached at the Metropolitan Tabernacle across nearly four decades.", count: "3,500+", searchTerm: "sermon" },
    { icon: "PenTool", title: "Articles & Blog", description: "Commentary, introductions, and essays exploring Spurgeon's thought and theology.", count: "200+", searchTerm: "article" },
    { icon: "BookOpen", title: "Books", description: "Spurgeon's own writings and select volumes from his personal library of 12,000 books.", count: "135+", url: ROUTES.Books },
    { icon: "GraduationCap", title: "Lectures", description: "Lectures from the Spurgeon Library Conference and academic presentations.", count: "50+", searchTerm: "lecture" },
    { icon: "Library", title: "The Spurgeon Library", description: "The premier center of Spurgeon scholarship, housing nearly 6,000 volumes from his personal library.", count: "6,000 vols", url: ROUTES.Library },
    { icon: "Users", title: "Conference", description: "An annual academic conference engaging Spurgeon scholarship for pastors and church leaders.", count: "Annual", searchTerm: "" },
  ],
};

export default function ResourcesSection({ eyebrow, heading, intro, items }) {
  const eb = eyebrow || DEFAULTS.eyebrow;
  const hd = heading || DEFAULTS.heading;
  const it = intro || DEFAULTS.intro;
  const resources = (items?.length ? items : DEFAULTS.items);

  return (
    <section className="py-24 md:py-36 bg-card">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
            {decodeEntities(eb)}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            {decodeEntities(hd)}
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-muted-foreground font-sans leading-relaxed">
            {decodeEntities(it)}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => {
            const Icon = ICONS[resource.icon] || Scroll;
            const defaultItem = DEFAULTS.items.find(d => d.title === resource.title);
            const href = resource.url || (resource.searchTerm ? ROUTES.Search + `?type=${resource.searchTerm}` : defaultItem?.url || "#");
            return (
              <motion.div
                key={`${resource.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}>
                <Link href={href} className="group block h-full">
                  <div className="bg-background border border-border rounded-xl p-8 h-full hover:border-primary/20 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-sans text-xs font-semibold text-accent tracking-wider">
                        {resource.count}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {decodeEntities(resource.title)}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                      {decodeEntities(resource.description)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
