import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import TimelineSection from "@/components/home/TimelineSection";

const sections = [
  {
    title: "The Boy Preacher",
    text: `Charles Haddon Spurgeon was born on June 19, 1834, in Kelvedon, Essex, England. The eldest of seventeen children, he was raised in a deeply devout Nonconformist family. His grandfather, James Spurgeon, was a pastor, and Charles spent much of his childhood in his grandfather's manse, surrounded by Puritan theology and the life of the church.

Even as a boy, Spurgeon was a voracious reader. By age six he had read "The Pilgrim's Progress" and would go on to read it over a hundred times throughout his life. His remarkable intellect and spiritual sensitivity marked him from the earliest days.`,
    quote: null,
  },
  {
    title: "A Snowy Conversion",
    text: `On January 6, 1850, a fifteen-year-old Spurgeon was making his way to church when a blizzard forced him to seek shelter in a small Primitive Methodist chapel in Colchester. The scheduled preacher didn't show, and a lay minister stood to deliver a simple message from Isaiah 45:22: "Look unto me, and be ye saved, all the ends of the earth."

The man looked directly at the young Spurgeon and said, "Young man, you look very miserable... Look to Jesus Christ." That moment transformed Spurgeon's life forever. He later wrote, "I did look, and the cloud was gone, the darkness had rolled away, and that moment I saw the sun."`,
    quote: {
      text: "I did look, and the cloud was gone, the darkness had rolled away, and that moment I saw the sun.",
      attribution: "Spurgeon, on his conversion",
    },
  },
  {
    title: "London's Pulpit Phenomenon",
    text: `At just nineteen years of age, Spurgeon became pastor of the New Park Street Chapel in Southwark, London. Within months, the chapel's 1,200 seats proved insufficient, and the congregation moved to increasingly larger venues—including the Exeter Hall and the Surrey Music Hall—to accommodate the thousands who came to hear him preach.

In 1861, the Metropolitan Tabernacle opened with seating for 5,600. It remained filled Sunday after Sunday for the next thirty-one years. Spurgeon's sermons were transcribed weekly, selling 25,000 copies each, and were translated into dozens of languages. He became known as the "Prince of Preachers."`,
    quote: {
      text: "Give me the Bible and the Holy Ghost, and I can convert the world.",
      attribution: "C.H. Spurgeon",
    },
  },
  {
    title: "More Than a Preacher",
    text: `Spurgeon's ministry extended far beyond the pulpit. He founded the Pastors' College in 1856 to train ministers for effective, gospel-centered preaching. He established the Stockwell Orphanage in 1867, providing a home for hundreds of destitute children. He oversaw a colportage association that distributed Christian literature across England.

He authored over 135 books, including the beloved "Morning and Evening" devotional, "The Treasury of David" commentary on the Psalms, and "Lectures to My Students," which remains a standard text in seminary education.`,
    quote: {
      text: "It is not how much we have, but how much we enjoy, that makes happiness.",
      attribution: "C.H. Spurgeon",
    },
  },
  {
    title: "An Enduring Legacy",
    text: `Spurgeon passed away on January 31, 1892, in Menton, France, at the age of fifty-seven. An estimated 100,000 people filed past his coffin, and sixty thousand lined the streets of London for his funeral procession. His Metropolitan Tabernacle Pulpit, comprising 63 volumes of sermons, constitutes the largest body of printed sermons in church history.

Today, his works continue to be read, preached, and studied around the world. The Spurgeon Library at Midwestern Baptist Theological Seminary houses nearly 6,000 volumes from his personal collection, preserving and making accessible the literary heritage of one of Christianity's most beloved voices.`,
    quote: null,
  },
];

const PORTRAIT_SRC = "https://media.base44.com/images/public/699e34d59ad598edd05d1adb/2f52ec14b_49549482306_5f51e94a0a_c.png";

function PortraitImage() {
  return (
    <>
      <div className="block md:hidden w-full rounded-xl overflow-hidden shadow-xl border border-border">
        <img src={PORTRAIT_SRC} alt="Charles Haddon Spurgeon" className="w-full h-auto block" />
        <p className="text-center font-sans text-xs text-muted-foreground italic py-2 bg-card">
          C.H. Spurgeon, photographed in London
        </p>
      </div>

      <div
        className="hidden md:block float-right ml-8 mb-6 rounded-xl overflow-hidden shadow-2xl border border-border"
        style={{ width: '45%', marginRight: '-30%' }}>
        <img src={PORTRAIT_SRC} alt="Charles Haddon Spurgeon" className="w-full h-auto block" />
        <p className="text-center font-sans text-xs text-muted-foreground italic py-2 bg-card">
          C.H. Spurgeon, photographed in London
        </p>
      </div>
    </>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%221%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <Link
              href={ROUTES.Home}
              className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors font-sans text-sm mb-8">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
              1834 — 1892
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Who Was
              <br />
              <span className="italic font-normal">Charles Spurgeon?</span>
            </h1>
            <p className="mt-6 font-sans text-primary-foreground/60 text-base leading-relaxed max-w-md">
              Pastor, author, orphan-founder, and prince of preachers — a life poured out in service of the gospel.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="relative w-56 h-72 md:w-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary-foreground/10">
              <img
                src="https://media.base44.com/images/public/699e34d59ad598edd05d1adb/599c2712e_49549482306_5f51e94a0a_c.png"
                alt="Charles Haddon Spurgeon"
                className="w-full h-full object-cover object-top sepia opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-0 right-0 text-center font-sans text-xs text-primary-foreground/70 italic">
                Charles Haddon Spurgeon
              </p>
            </div>
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto px-6 pb-16">
          <p className="font-sans text-xs text-primary-foreground/40 tracking-[0.2em] uppercase mb-3 text-center">A Brief Introduction</p>
          <a
            href="https://www.youtube.com/watch?v=98Qw3FH1lPA"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl overflow-hidden aspect-video shadow-2xl border border-primary-foreground/10 relative group">
            <img
              src="https://img.youtube.com/vi/98Qw3FH1lPA/maxresdefault.jpg"
              alt="Charles Spurgeon — The Prince of Preachers"
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <PlayCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-16">
          {sections.map((section, index) => (
            <React.Fragment key={section.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                  {section.title}
                </h2>
                <div className="font-sans text-muted-foreground leading-[1.8] whitespace-pre-line text-base">
                  {section.text}
                </div>
              </motion.div>

              {index === 1 && <PortraitImage />}

              {section.quote && (
                <motion.blockquote
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="my-4 py-8 px-8 md:px-12 bg-primary/5 border-l-4 border-accent rounded-r-xl">
                  <p className="font-serif text-xl md:text-2xl italic text-foreground/80 leading-relaxed mb-3">
                    "{section.quote.text}"
                  </p>
                  <cite className="font-sans text-sm text-muted-foreground not-italic">
                    — {section.quote.attribution}
                  </cite>
                </motion.blockquote>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-20 p-8 bg-card rounded-xl border border-border text-center">
          <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
            Explore His Works
          </h3>
          <p className="font-sans text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Search and read through thousands of sermons, articles, and books from the Prince of Preachers.
          </p>
          <Link
            href={ROUTES.Search}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm font-medium hover:bg-primary/90 transition-colors group">
            Search the Library
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <TimelineSection />
      <FooterSection />
    </div>
  );
}
