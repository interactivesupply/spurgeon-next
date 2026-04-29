import React from "react";
import { motion } from "framer-motion";

const stats = [
  { number: "3,561", label: "Sermons Published", description: "The largest body of sermon literature in history" },
  { number: "63", label: "Volumes", description: "Spanning the New Park Street & Metropolitan Tabernacle Pulpit" },
  { number: "38", label: "Years of Ministry", description: "Faithfully preaching at the Metropolitan Tabernacle" },
  { number: "14,000", label: "Members", description: "The largest congregation in the world during his lifetime" },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-secondary/50 border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center">
              <p className="text-[#654b39] text-4xl font-bold md:text-5xl">
                {stat.number}
              </p>
              <p className="font-sans text-sm font-semibold text-foreground mt-2 tracking-wide uppercase">
                {stat.label}
              </p>
              <p className="font-sans text-xs text-muted-foreground mt-1 leading-relaxed hidden md:block">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
