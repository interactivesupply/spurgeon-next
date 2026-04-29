import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const milestones = [
  { year: "1834", title: "Born in Kelvedon, Essex", description: "Charles Haddon Spurgeon was born on June 19, 1834, in Kelvedon, Essex, England, to a Nonconformist minister." },
  { year: "1844", title: "Stays with Grandparents", description: "Spurgeon spent formative years with his grandfather, a Congregationalist pastor, deeply shaping his early faith." },
  { year: "1849", title: "Moves to Newmarket", description: "Spurgeon moved to Newmarket to teach at a school, continuing his voracious reading and self-education in theology." },
  { year: "1850", title: "Conversion at Age 15", description: "On a snowy January morning, a lay preacher's words on Isaiah 45:22 — \"Look unto me, and be ye saved\" — changed his life forever." },
  { year: "1851", title: "First Sermon Preached", description: "At 16, Spurgeon preached his first sermon in a cottage at Teversham and quickly became known for his gifts." },
  { year: "1852", title: "Pastor at Waterbeach", description: "At just 17, Spurgeon became pastor of the Waterbeach Baptist Chapel, transforming a small village congregation." },
  { year: "1854", title: "Called to New Park Street", description: "At 19, Spurgeon was called to the historic New Park Street Chapel in London. Crowds quickly outgrew the building." },
  { year: "1856", title: "Surrey Gardens Music Hall", description: "Services moved to the Surrey Gardens Music Hall, drawing over 10,000 — and marking a tragedy when a false alarm caused a stampede." },
  { year: "1857", title: "Preaches to 23,000", description: "Spurgeon preached to an estimated 23,654 people at the Crystal Palace — one of the largest crowds ever addressed by a single voice." },
  { year: "1861", title: "Metropolitan Tabernacle Opens", description: "The Metropolitan Tabernacle, seating 5,600, opened its doors and became the epicenter of his ministry for three decades." },
  { year: "1865", title: "Founding of Pastors' College", description: "Spurgeon founded the Pastors' College to train men for ministry, equipping hundreds of pastors who spread across the globe." },
  { year: "1866", title: "Stockwell Orphanage Founded", description: "Spurgeon opened the Stockwell Orphanage, eventually housing and educating over 500 children at a time." },
  { year: "1865", title: "Sword & Trowel Magazine", description: "He launched The Sword and the Trowel, a monthly magazine sharing sermons, reviews, and ministry news." },
  { year: "1887", title: "Downgrade Controversy", description: "Spurgeon withdrew from the Baptist Union over doctrinal compromise, a courageous stand that cost him many friendships." },
  { year: "1892", title: "Legacy Endures", description: "Spurgeon passed into glory on January 31, 1892. He left 63 volumes of sermons, 135+ books, and a legacy shaping the church worldwide." },
];

const DOT_COUNT = 6;

export default function TimelineSection() {
  const scrollRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      const idx = Math.round((scrollLeft / maxScroll) * (DOT_COUNT - 1));
      setActiveDot(Math.min(idx, DOT_COUNT - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="bg-[hsl(var(--foreground))] py-24 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20">
          <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
            A Life of Faithful Ministry
          </p>
          <h2 className="text-[hsl(var(--card))] text-4xl font-bold md:text-5xl">The Spurgeon Story</h2>
        </motion.div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-6 mt-2 px-6">
        <div className="flex items-start" style={{ width: `${milestones.length * 200}px` }}>
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative flex flex-col items-center flex-1">
              <div className="flex items-center w-full mb-4">
                <div className={`flex-1 h-px bg-border ${index === 0 ? "invisible" : ""}`} />
                <div className="bg-[hsl(var(--accent))] text-black rounded-full w-2.5 h-2.5 flex-shrink-0" />
                <div className={`flex-1 h-px bg-border ${index === milestones.length - 1 ? "invisible" : ""}`} />
              </div>

              <div className="text-center px-3 w-full">
                <span className="text-[hsl(var(--accent))] text-2xl font-bold block">
                  {milestone.year}
                </span>
                <h3 className="font-serif text-sm font-semibold text-foreground mt-1 mb-1 leading-snug">
                  {milestone.title}
                </h3>
                <p className="font-sans text-muted-foreground leading-relaxed text-xs">
                  {milestone.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              const { scrollWidth, clientWidth } = el;
              const maxScroll = scrollWidth - clientWidth;
              el.scrollTo({ left: (i / (DOT_COUNT - 1)) * maxScroll, behavior: "smooth" });
            }}
            className={`rounded-full transition-all duration-300 ${
              i === activeDot ? "w-4 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-accent/25 hover:bg-accent/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
