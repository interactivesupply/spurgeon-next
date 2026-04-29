import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, ArrowRight, QrCode, Compass } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import FooterSection from "@/components/home/FooterSection";
import TourStop from "@/components/library/TourStop";
import TourQRModal from "@/components/library/TourQRModal";

const stops = [
  {
    id: "01",
    title: "The Conversion",
    subtitle: "Colchester, 1850",
    image: "https://images.unsplash.com/photo-1578926078693-4b7b53f7d2e0?w=900&q=80",
    paintingDescription: "This painting depicts the interior of the Primitive Methodist chapel in Colchester on a wintry January morning. A young Spurgeon, barely fifteen, sits listening to a lay preacher who points directly at him with words that would alter the course of his life.",
    narrative: `On January 6, 1850, a blizzard forced the young Charles Spurgeon to take shelter in a small Primitive Methodist chapel on Artillery Street in Colchester. The regular preacher could not attend, and a lay minister — barely educated — rose to preach from Isaiah 45:22: "Look unto me, and be ye saved, all the ends of the earth."

The man, noticing Spurgeon's solemn countenance, pointed at him and said: "Young man, you look very miserable — and you will always be miserable in life and in death if you don't obey my text. But if you obey it now, this moment, you will be saved." Spurgeon later wrote that he "looked," and in an instant the darkness lifted.

This moment of simple, unadorned gospel preaching shaped Spurgeon's own preaching philosophy for the rest of his life. He would spend forty years calling congregations to "look to Christ" in the same direct, unassuming manner.`,
    quote: "I did look, and the cloud was gone, the darkness had rolled away, and that moment I saw the sun.",
  },
  {
    id: "02",
    title: "New Park Street",
    subtitle: "London, 1854",
    image: "https://images.unsplash.com/photo-1519070994522-88c6b756330e?w=900&q=80",
    paintingDescription: "The painting shows the interior of New Park Street Chapel, its galleries overflowing with people straining to hear the teenage preacher whose reputation had spread rapidly through London. Gas lamps cast warm light over upturned faces.",
    narrative: `In 1854, Spurgeon — just nineteen years old — accepted a trial pastorate at New Park Street Chapel in Southwark, London. The congregation had fallen to a mere eighty or so regular attenders. Within weeks the building was packed to overflowing.

Word spread of the extraordinary young preacher from Cambridge. Thousands came, filling the galleries, the aisles, and spilling out into the streets. The chapel, built for 1,200, could not contain the crowds. Services were moved to Exeter Hall and then to the Surrey Music Hall, which seated 10,000.

Spurgeon's preaching was vivid, direct, and saturated with Scripture. He spoke without notes and with a voice that could reportedly fill any building without amplification. This was the beginning of an unparalleled metropolitan ministry.`,
    quote: "I would rather speak five words on my knees than five thousand words in the flesh.",
  },
  {
    id: "03",
    title: "The Metropolitan Tabernacle",
    subtitle: "London, 1861",
    image: "https://images.unsplash.com/photo-1548625149-720834f31516?w=900&q=80",
    paintingDescription: "A sweeping view of the Metropolitan Tabernacle's auditorium on opening day, 1861 — 5,600 seats filled, every eye fixed on the pulpit where Spurgeon stands. The neoclassical columns and tiered galleries speak to a congregation-built monument to gospel preaching.",
    narrative: `After years of temporary venues, the Metropolitan Tabernacle opened its doors on March 18, 1861, in Newington, South London. Built at a cost of £31,000 — paid entirely from congregational giving — it seated 5,600 with standing room for another thousand.

Spurgeon preached there every Sunday for thirty-one years. The Tabernacle was not merely a church but a ministry hub: it housed the Pastors' College, a colportage association, a ladies' benevolent society, and dozens of mission stations throughout the city.

The building still stands today, rebuilt after a fire in 1898 and a World War II bombing, as a living testament to the ministry Spurgeon planted. The Metropolitan Tabernacle congregation continues to preach the gospel from the same address.`,
    quote: "The Word of God is like a lion. You don't have to defend a lion. All you have to do is let the lion loose, and the lion will defend itself.",
  },
  {
    id: "04",
    title: "The Pastors' College",
    subtitle: "London, 1856",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=80",
    paintingDescription: "Spurgeon is depicted at the center of a group of young ministers, seated in a study room lined with books. His posture is relaxed yet engaged — this is the Spurgeon who loved to train and equip, who saw the multiplication of gospel ministers as among his highest callings.",
    narrative: `What began as Spurgeon tutoring a single student in 1856 grew into the Pastors' College — one of the most influential ministerial training institutions in Victorian England. By the end of Spurgeon's life, over 900 men had been trained and sent out to pastor churches across Britain and around the world.

Spurgeon's philosophy of training was intensely practical. He cared little for academic abstraction and everything for men who could preach the gospel clearly, love their congregations genuinely, and endure hardship faithfully. He funded much of the college himself, from his prodigious writing royalties.

The Annual Conference of the Pastors' College was among the great events of the Victorian Christian calendar — hundreds of former students returning to sit under their beloved president once more. Spurgeon's addresses at these conferences were published as "An All-Round Ministry."`,
    quote: "Every Christian is either a missionary or an impostor.",
  },
  {
    id: "05",
    title: "The Stockwell Orphanage",
    subtitle: "London, 1867",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80",
    paintingDescription: "Children in Victorian dress gather on the grounds of the Stockwell Orphanage, sunlight falling across the main building. Spurgeon stands among them, a familiar and beloved figure in the lives of hundreds of children who had no other home.",
    narrative: `In 1867, Spurgeon opened the Stockwell Orphanage, initially for boys and later expanded to include girls. The institution was founded in response to a gift from a widow who wished to see an orphanage built "without a shred of sectarianism." Spurgeon agreed, and the orphanage welcomed children of any denomination.

At its height, the orphanage housed and educated hundreds of children in a purpose-built campus of cottages, each designed to provide a family-like environment rather than the institutional bleakness typical of Victorian charitable homes.

Spurgeon visited regularly, knowing many of the children by name. The orphanage was a tangible embodiment of his belief that genuine Christian faith must express itself in practical compassion. It continued operating for over a century after his death.`,
    quote: "It is not how much we have, but how much we enjoy, that makes happiness.",
  },
  {
    id: "06",
    title: "The Final Years & Legacy",
    subtitle: "Menton, 1892",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80",
    paintingDescription: "Spurgeon, visibly weary from years of illness, sits beside a window in his villa in Menton, France — the warm Mediterranean light illuminating a worn Bible open on his lap. It is a portrait of a man whose body had given out before his spirit did.",
    narrative: `In the last decade of his life, Spurgeon suffered greatly from gout, kidney disease, and depression — what he called "the Slough of Despond." He traveled repeatedly to Menton in the south of France for his health, often unable to preach for months at a time.

He died on January 31, 1892, at the age of fifty-seven, in Menton. His body was returned to London, where an estimated 100,000 people filed past his coffin over four days of public viewing. Sixty thousand lined the streets for his funeral procession to West Norwood Cemetery.

His legacy endures in the 63 volumes of the Metropolitan Tabernacle Pulpit, the more than 135 books he authored, the thousands of ministers he trained, and the countless lives transformed by his preaching. The Spurgeon Library at Midwestern Seminary now serves as a center for the ongoing study of his life and theology.`,
    quote: "I have a great need for Christ; I have a great Christ for my need.",
  },
];

export default function DigitalTour() {
  const router = useRouter();
  const initialStop = (router.query.stop as string) || stops[0].id;
  const initialIndex = stops.findIndex(s => s.id === initialStop);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [qrOpen, setQrOpen] = useState(false);

  const current = stops[currentIndex];

  const prev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const next = () => setCurrentIndex(i => Math.min(stops.length - 1, i + 1));

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!router.isReady) return;
    const stopParam = router.query.stop as string;
    if (stopParam) {
      const idx = stops.findIndex(s => s.id === stopParam);
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [router.isReady, router.query.stop]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          <Link
            href={ROUTES.Library}
            className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors font-sans text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to the Library
          </Link>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-accent" />
                <span className="font-sans text-xs text-primary-foreground/50 uppercase tracking-widest">
                  Self-Guided Digital Tour
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                The Spurgeon Gallery
              </h1>
              <p className="font-sans text-sm text-primary-foreground/50 mt-2 max-w-lg">
                Six paintings. Six chapters of a remarkable life. Explore each work online, or scan the QR codes in person at the Spurgeon Library.
              </p>
            </div>
            <button
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground/40 font-sans text-sm transition-all">
              <QrCode className="w-4 h-4" />
              QR Code for This Stop
            </button>
          </div>

          <div className="flex gap-2 mt-8 flex-wrap">
            {stops.map((stop, i) => (
              <button
                key={stop.id}
                onClick={() => setCurrentIndex(i)}
                className={`px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all ${
                  i === currentIndex
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary-foreground/10 text-primary-foreground/50 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                }`}>
                {stop.id} — {stop.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <TourStop key={current.id} stop={current} />
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border font-sans text-sm text-foreground hover:border-primary/40 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="font-sans text-sm text-muted-foreground">
            {currentIndex + 1} of {stops.length}
          </span>
          {currentIndex < stops.length - 1 ? (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 transition-colors">
              Next Stop
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={ROUTES.Library}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-sans text-sm font-semibold hover:bg-accent/90 transition-colors">
              Finish Tour
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      <TourQRModal open={qrOpen} onClose={() => setQrOpen(false)} stop={current} />

      <FooterSection />
    </div>
  );
}
