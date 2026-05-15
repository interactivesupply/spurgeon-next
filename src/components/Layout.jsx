import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ROUTES } from "@/lib/routes";
import { Search, Menu, X, ChevronDown, MicVocal, BookMarked, Newspaper, FileText, Video, Scroll, Library } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import SpurgeonWorksMenu from "@/components/nav/SpurgeonWorksMenu";
import CenterResourcesMenu from "@/components/nav/CenterResourcesMenu";

function MobileMenuSection({ label, icon: Icon, sections, onClose }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-primary-foreground/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full py-3 font-sans text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent/70" />
          {label}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-3 space-y-4">
          {sections.map((sec) => {
            const SIcon = sec.icon;
            return (
              <div key={sec.id}>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <SIcon className="w-3.5 h-3.5 text-accent" />
                  <span className="font-sans text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">{sec.label}</span>
                </div>
                <ul className="space-y-1 pl-6">
                  {sec.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.to}
                        onClick={onClose}
                        className="block font-sans text-sm text-primary-foreground/50 hover:text-accent transition-colors py-1">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children, nav }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = React.useRef(null);

  const isHome = router.pathname === "/";
  const isAbout = router.pathname === "/about";
  const isLibrary = router.pathname === "/library";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [router.pathname, router.asPath]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(ROUTES.Search + "?q=" + encodeURIComponent(searchQuery.trim()));
    }
  };

  const navBg = isHome
    ? scrolled
      ? "bg-foreground/95 backdrop-blur-md shadow-md"
      : "bg-transparent"
    : "bg-foreground/95 backdrop-blur-md shadow-sm";

  return (
    <div className="min-h-screen bg-background">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href={ROUTES.Home} className="flex items-center group">
              <img
                src="https://spurgeoncenter.wpenginepowered.com/wp-content/uploads/2026/04/3fc58e03b_logo-cs-horz-top2.png"
                alt="Spurgeon.org"
                className="h-10 w-auto object-contain md:hidden" />
              <img
                src="https://spurgeoncenter.wpenginepowered.com/wp-content/uploads/2026/04/3fc58e03b_logo-cs-horz-top2.png"
                alt="Spurgeon.org"
                className="hidden md:block h-16 w-auto object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <SpurgeonWorksMenu columns={nav?.headerSpurgeonWorks} />
              <CenterResourcesMenu columns={nav?.headerCenterResources} />
              {/* Inline editor-managed top-level links (About, Library, etc.).
                  Falls back to a couple of sensible defaults if empty. */}
              {(nav?.headerInlineLinks?.length
                ? nav.headerInlineLinks
                : [{ label: 'About Spurgeon', url: ROUTES.About }, { label: 'Visit the Library', url: ROUTES.Library }]
              ).map((link) => {
                const active = router.asPath === link.url || router.pathname === link.url;
                return (
                  <Link
                    key={link.url + link.label}
                    href={link.url}
                    className={`font-sans text-sm transition-colors ${
                      active ? "text-accent" : "text-primary-foreground/60 hover:text-primary-foreground"
                    }`}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-accent/50 bg-accent/10 text-primary-foreground/80 hover:bg-accent/20 hover:text-accent hover:border-accent transition-all font-sans text-sm">
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
                aria-label="Toggle menu">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="absolute inset-0 flex items-center px-6 bg-foreground/98 backdrop-blur-md border-b border-accent/20">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full max-w-3xl mx-auto">
                <Search className="w-5 h-5 text-accent shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sermons, books, articles..."
                  className="flex-1 bg-transparent font-sans text-lg text-primary-foreground placeholder:text-primary-foreground/40 outline-none" />
                {searchQuery && (
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent text-accent-foreground rounded-full font-sans text-sm font-medium hover:bg-accent/90 transition-colors shrink-0">
                    Search
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="text-primary-foreground/40 hover:text-primary-foreground transition-colors p-1 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </form>
              <SearchAutocomplete
                query={searchQuery}
                inputRef={searchInputRef}
                onSelect={() => { setSearchOpen(false); setSearchQuery(""); }}
                onSubmitFallback={() => { setSearchOpen(false); setSearchQuery(""); }} />
            </div>
          )}
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-foreground border-t border-primary-foreground/10 max-h-[80vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              <MobileMenuSection
                label="Spurgeon's Works"
                icon={Scroll}
                sections={[
                  {
                    id: "sermons", label: "Sermons", icon: MicVocal,
                    links: [
                      { label: "All Sermons", to: ROUTES.Search + "?type=sermon" },
                      { label: "New Park Street Pulpit", to: ROUTES.Search + "?collection=new-park-street-pulpit" },
                      { label: "Metropolitan Tabernacle", to: ROUTES.Search + "?collection=metropolitan-tabernacle-pulpit" },
                    ],
                  },
                  {
                    id: "books", label: "Books", icon: BookMarked,
                    links: [
                      { label: "All Books", to: ROUTES.Books },
                      { label: "Morning & Evening", to: ROUTES.MorningAndEvening },
                      { label: "Faith's Check Book", to: ROUTES.FaithsCheckBook },
                      { label: "The Treasury of David", to: ROUTES.TreasuryOfDavid },
                      { label: "All of Grace", to: ROUTES.BookReader("all-of-grace") },
                    ],
                  },
                  {
                    id: "magazine", label: "Sword & Trowel", icon: Newspaper,
                    links: [
                      { label: "Browse Issues", to: ROUTES.SwordAndTrowel },
                      { label: "Spurgeon Articles", to: ROUTES.SwordAndTrowel + "?category=spurgeon_article" },
                      { label: "Book Reviews", to: ROUTES.SwordAndTrowel + "?category=book_review" },
                      { label: "News Reports", to: ROUTES.SwordAndTrowel + "?category=news_reports" },
                    ],
                  },
                ]}
                onClose={() => setMobileOpen(false)} />

              <Link
                href={ROUTES.About}
                onClick={() => setMobileOpen(false)}
                className={`block py-3 font-sans text-sm transition-colors border-b border-primary-foreground/5 ${
                  isAbout ? "text-accent" : "text-primary-foreground/60 hover:text-primary-foreground"
                }`}>
                About Spurgeon
              </Link>

              <MobileMenuSection
                label="Our Resources"
                icon={Library}
                sections={[
                  {
                    id: "articles", label: "Articles", icon: FileText,
                    links: [
                      { label: "All Articles", to: ROUTES.Search + "?type=article" },
                      { label: "Blog Posts", to: ROUTES.Search + "?type=blog" },
                      { label: "Spurgeon on Prayer", to: ROUTES.Search + "?q=prayer&type=article" },
                      { label: "Spurgeon on Grace", to: ROUTES.Search + "?q=grace&type=article" },
                    ],
                  },
                  {
                    id: "videos", label: "Videos & Conference Media", icon: Video,
                    links: [
                      { label: "All Lectures", to: ROUTES.Search + "?type=lecture" },
                      { label: "Theology Lectures", to: ROUTES.Search + "?q=theology&type=lecture" },
                      { label: "Ministry Lectures", to: ROUTES.Search + "?q=ministry&type=lecture" },
                      { label: "All Conference Media", to: ROUTES.Search + "?type=conference_media" },
                      { label: "Annual Conference", to: ROUTES.Search + "?q=conference" },
                      { label: "Symposiums", to: ROUTES.Search + "?q=symposium" },
                    ],
                  },
                ]}
                onClose={() => setMobileOpen(false)} />

              <Link
                href={ROUTES.Library}
                onClick={() => setMobileOpen(false)}
                className={`block py-3 font-sans text-sm transition-colors border-b border-primary-foreground/5 ${
                  isLibrary ? "text-accent" : "text-primary-foreground/60 hover:text-primary-foreground"
                }`}>
                Visit the Library
              </Link>

              <Link
                href={ROUTES.Search}
                className="flex items-center gap-2 pt-3 font-sans text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                <Search className="w-4 h-4" />
                Search the Library
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className={isHome ? "" : "pt-16 md:pt-20"}>
        {children}
      </main>
    </div>
  );
}
