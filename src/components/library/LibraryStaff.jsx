import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, User } from "lucide-react";

const directors = [
  {
    name: "Dr. Geoff Chang",
    title: "Curator of the Spurgeon Library",
    affiliation: "MBTS",
    url: "https://www.mbts.edu",
    photo: "https://media.base44.com/images/public/699e34d59ad598edd05d1adb/dc369a180_chang-hs-1500-x-1500-px.jpg",
  },
  {
    name: "Dr. Jeff Medders",
    title: "General Editor and Fellow of the Spurgeon Library",
    affiliation: "MBTS",
    url: "https://www.mbts.edu",
    photo: "https://media.base44.com/images/public/699e34d59ad598edd05d1adb/9a8bb57eb_54892430575_361b7af039_k-e1765571968401.jpg",
  },
];

const researchAssistants = [
  "Research Assistant",
  "Research Assistant",
  "Research Assistant",
];

export default function LibraryStaff() {
  return (
    <div className="bg-card border-t border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">Our Team</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Spurgeon Library Staff
          </h2>
          <p className="font-sans text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
            The Spurgeon Library is led by a team of scholars dedicated to preserving and promoting the legacy of Charles Haddon Spurgeon.
          </p>
        </motion.div>

        {/* Directors */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {directors.map((person, i) => (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-center"
            >
              <img
                src={person.photo}
                alt={person.name}
                className="w-26 h-26 rounded-xl object-cover object-top shadow-lg shrink-0 relative z-10 -mr-8"
              style={{ width: '6.5rem', height: '6.5rem' }}
              />
              <div className="bg-background border border-border rounded-2xl pl-12 pr-6 py-5 flex-1">
                <h3 className="font-serif text-lg font-semibold text-foreground">{person.name}</h3>
                <p className="font-sans text-sm text-muted-foreground mt-0.5">{person.title}</p>
                <a
                  href={person.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 font-sans text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  {person.affiliation}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Research Assistants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5 text-center">Research Assistants</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {researchAssistants.map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full font-sans text-sm text-muted-foreground"
              >
                <User className="w-3.5 h-3.5 text-muted-foreground/50" />
                {name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Word from the President */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 pt-10 border-t border-border"
        >
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4 text-center">From Our President</p>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">A Word from Dr. Jason Allen</h3>
          <div className="max-w-4xl mx-auto relative flex flex-col md:flex-row items-center">
            <img
              src="https://media.base44.com/images/public/699e34d59ad598edd05d1adb/7c8de5f4e_jkallen_headshot_square_1200-e1743173887118-1060x710.jpg"
              alt="Dr. Jason Allen"
              className="w-44 h-44 md:w-52 md:h-52 rounded-2xl object-cover object-top shadow-xl shrink-0 relative z-10 md:-mr-8"
            />
            <blockquote className="bg-primary/5 border-l-4 border-accent rounded-r-xl pl-14 pr-8 py-6 w-full">
              <p className="font-serif text-lg italic text-foreground/80 leading-relaxed">
                "As owners of the Spurgeon Library, Midwestern enjoys a singular stewardship to our students, our denomination, and the church at large. The Charles Spurgeon Lectures on Biblical Preaching equip preachers and gospel ministers and fulfill our mission to exist for the church. The goal of the lectures is to equip attendees and serve the church by speaking on and modeling expositional preaching."
              </p>
              <cite className="block font-sans text-sm text-muted-foreground not-italic mt-4">
                — Dr. Jason Allen, President, Midwestern Baptist Theological Seminary
              </cite>
            </blockquote>
          </div>
        </motion.div>
      </div>
    </div>
  );
}