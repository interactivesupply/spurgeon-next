import React, { useState } from "react";
import { ROUTES } from "@/lib/routes";
import { Sun, BookOpen, BookMarked, GraduationCap, DoorOpen, Star, ScrollText, User } from "lucide-react";
import BooksHero from "@/components/books/BooksHero";
import BookCategoryTabs from "@/components/books/BookCategoryTabs";
import BookCard from "@/components/books/BookCard";
import FooterSection from "@/components/home/FooterSection";

const books = [
  {
    id: "morning_and_evening",
    title: "Morning and Evening",
    category: "Devotional",
    categoryValue: "devotional",
    description: "Two devotional readings for every day of the year — one for the morning watch, one for the close of day. Perhaps Spurgeon's most beloved work.",
    href: ROUTES.MorningAndEvening,
    icon: Sun,
    subscribable: true,
    accentColor: "#526B41",
    iconBg: "#526B4120",
    iconColor: "#526B41",
    categoryColor: "#526B41",
  },
  {
    id: "faiths_check_book",
    title: "Faith's Check Book",
    category: "Devotional",
    categoryValue: "devotional",
    description: "365 daily promises from Scripture, each opened and applied by Spurgeon — a treasury of divine assurances for every occasion.",
    href: ROUTES.FaithsCheckBook,
    icon: BookOpen,
    subscribable: true,
    accentColor: "#7a9b5e",
    iconBg: "#7a9b5e20",
    iconColor: "#7a9b5e",
    categoryColor: "#7a9b5e",
  },
  {
    id: "treasury_of_david",
    title: "The Treasury of David",
    category: "Biblical Commentary",
    categoryValue: "commentary",
    description: "Spurgeon's monumental commentary on all 150 Psalms — exposition, illustrations, and a wealth of quotations from other authors.",
    href: ROUTES.TreasuryOfDavid,
    icon: ScrollText,
    subscribable: false,
    accentColor: "#664B39",
    iconBg: "#664B3920",
    iconColor: "#664B39",
    categoryColor: "#664B39",
  },
  {
    id: "all_of_grace",
    title: "All of Grace",
    category: "Theology & Doctrine",
    categoryValue: "theology",
    description: "An earnest word with those who are seeking salvation. A short, powerful presentation of the gospel — free grace for all who come.",
    href: ROUTES.BookReader("all-of-grace"),
    icon: Star,
    subscribable: false,
    accentColor: "#B29E76",
    iconBg: "#B29E7620",
    iconColor: "#8a7a58",
    categoryColor: "#8a7a58",
  },
  {
    id: "lectures_to_my_students",
    title: "Lectures to My Students",
    category: "Pastoral & Practical",
    categoryValue: "pastoral",
    description: "Collected addresses to the students of the Pastors' College — practical wisdom on preaching, ministry, and the pastoral life.",
    href: ROUTES.BookReader("lectures-to-my-students"),
    icon: GraduationCap,
    subscribable: false,
    accentColor: "#526B41",
    iconBg: "#526B4120",
    iconColor: "#526B41",
    categoryColor: "#526B41",
  },
  {
    id: "around_the_wicket_gate",
    title: "Around the Wicket Gate",
    category: "Pastoral & Practical",
    categoryValue: "pastoral",
    description: "A friendly talk with seekers concerning the gate of salvation — gentle, evangelistic, and searching.",
    href: ROUTES.BookReader("around-the-wicket-gate"),
    icon: DoorOpen,
    subscribable: false,
    accentColor: "#B29E76",
    iconBg: "#B29E7620",
    iconColor: "#8a7a58",
    categoryColor: "#8a7a58",
  },
  {
    id: "an_all_round_ministry",
    title: "An All-Round Ministry",
    category: "Pastoral & Practical",
    categoryValue: "pastoral",
    description: "Addresses to ministers and students on the full scope of pastoral work, from Spurgeon's conference sermons.",
    href: ROUTES.BookReader("an-all-round-ministry"),
    icon: BookMarked,
    subscribable: false,
    accentColor: "#664B39",
    iconBg: "#664B3920",
    iconColor: "#664B39",
    categoryColor: "#664B39",
  },
  {
    id: "autobiography",
    title: "Autobiography of Charles H. Spurgeon",
    category: "Autobiographical",
    categoryValue: "autobiography",
    description: "Compiled from his diary, letters, and records — the life story of Spurgeon in his own words and those who knew him best.",
    href: ROUTES.BookReader("autobiography"),
    icon: User,
    subscribable: false,
    accentColor: "#9e8e6e",
    iconBg: "#9e8e6e20",
    iconColor: "#7a6e55",
    categoryColor: "#7a6e55",
  },
];

export default function Books() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? books
    : books.filter((b) => b.categoryValue === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <BooksHero />
      <BookCategoryTabs active={activeCategory} onChange={setActiveCategory} />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
