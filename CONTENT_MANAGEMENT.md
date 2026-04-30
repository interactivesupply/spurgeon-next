# Content Management Overview

A guide to how the Spurgeon Center website is built and how content gets onto it. Written for editors, project sponsors, and anyone managing content — no engineering background assumed.

---

## The Big Picture

The site is built in two pieces that talk to each other:

```
┌──────────────────────────┐         ┌──────────────────────────┐
│       WordPress          │         │     Next.js frontend     │
│   (the editing system)   │ ──────▶ │ (what the public sees)   │
│   spurgeoncenter.        │  data   │   spurgeon.org           │
│   wpengine.com/wp-admin  │         │   (public website)       │
└──────────────────────────┘         └──────────────────────────┘
       Editors log in here.            Static + fast. Built from
       All content lives here.          WordPress data.
```

**WordPress** is the editor's home — it's where every piece of content is created, edited, and managed. Editors never touch the public site directly.

**The public site** (Next.js) is built from WordPress data and served from Cloudflare's edge network. It's fast because it's pre-built into static files; visitors don't hit WordPress directly.

This pattern is called **"headless WordPress."** The public site is decoupled ("headless") from the WordPress editor, which means we get WordPress's familiar editing tools plus a modern fast frontend.

---

## What Editors Can Manage

Everything visible on the site is editable in WordPress. Nothing is hardcoded. The major content areas:

### Pages (one record per page)

| WordPress location | What it controls |
|---|---|
| Pages → Home | Hero, stats, resources cards, library visit section |
| Pages → About | Hero, intro video, narrative sections, portrait, bottom CTA |
| Pages → Library | Hero, carousel, video, digital tour CTA, visit info, president's quote |
| Site Settings | Footer (signature, quote, copyright), MBTS banner, timeline (used on Home + About) |

Each page has a tabbed editor with logical groupings (Hero, Stats, Resources, etc.) so editors aren't scrolling through one giant form.

### Catalog Content (many records each)

These show up as their own menu items in the WordPress sidebar:

| WordPress section | What it is | Approx count |
|---|---|---|
| Sermons | Charles Spurgeon's sermons | ~16 today, ~3,500 at full scale |
| Magazine Articles | Sword & Trowel articles | ~20 today |
| Devotional Entries | Morning & Evening + Faith's Check Book | ~13 today |
| Treasury Entries | Treasury of David verse-by-verse | ~6 today |
| Book Chapters | Chapters of Spurgeon's books | ~6 today |
| Books | The 8-book catalog on `/books` | 8 |
| Tour Stops | The 6-painting Library digital tour | 6 |
| Library Staff | Directors + research assistants | 5 |

Each of these is a "Custom Post Type" — a list of records, each with its own edit screen and ACF fields tailored to its content shape.

### Site Settings (single record, shared everywhere)

`Site Settings` in the WP admin sidebar — a single page with tabs for:

- **Footer** — signature image, about paragraph, quote, MBTS pursue link
- **MBTS Banner** — eyebrow, heading, body, CTA
- **Timeline** — the 15 milestones used on Home + About pages
- **Headless Frontend** — the URL of the public site + the preview secret

Editing any of these updates *everywhere they appear* on the public site.

---

## Editor Workflow

### 1. Log in

Go to `https://spurgeoncenter.wpengine.com/wp-admin` and sign in with your WordPress credentials.

### 2. Find the content you want to edit

- **Editing a static page** (Home, About, Library): Pages → click the page name
- **Editing a sermon**: Sermons → click the sermon title
- **Editing site-wide footer / banner / timeline**: Site Settings (left sidebar)
- **Editing a tour painting**: Tour Stops → click the stop

### 3. Make changes

The fields on each screen mirror what's on the public site. There are short instructions under each field. Repeating sections (like Stats or Tour Stops) can be reordered by drag-and-drop.

### 4. Preview before publishing

For drafts and unpublished changes:

1. Save as **Draft** (or just hit "Save Changes")
2. Click **Preview** in the right sidebar
3. A new tab opens to the public site with your draft applied — an amber banner at the top says "You're viewing a draft preview" with an "Exit preview" button
4. Click around to see how the change looks

This works for sermons, articles, tour stops, devotionals, treasury entries, books, and book chapters. The preview uses the live frontend layout, so what you see is exactly what visitors will see once published.

### 5. Publish

When you're happy, click **Publish** (or **Update** for existing posts). Within about an hour, the change goes live on the public site (see "How fast do changes go live" below).

---

## Search (Algolia)

Search on the public site is powered by [Algolia](https://www.algolia.com) — a hosted search service that's faster and more relevant than WordPress's built-in search.

**You don't have to do anything for search to stay current.** Whenever you publish, edit, or delete a sermon/article/etc., WordPress automatically pushes the change to Algolia. Visitors searching the site will see your update typically within seconds.

If something seems wrong with search (rare), an admin can run a manual reindex command — but routine edits don't require it.

---

## Images

All images go through the **WordPress Media Library**:

- **Uploading**: Media → Add New, or upload directly from any image field on a post
- **Reuse**: An image uploaded once can be selected anywhere on the site
- **SVG uploads** are enabled (icons, signatures, logos)
- **Image fields** on posts (e.g., Sermon Thumbnail, Tour Stop Painting, Author Photo) accept any image from the Media Library

The original site used images hosted on a third-party service. All of those have been migrated into the WordPress Media Library so the Center owns and controls every image.

---

## How Fast Do Changes Go Live?

The public site is cached so visitors get a fast experience. There's a tradeoff: cached content takes a moment to reflect new edits.

| Page type | Update window |
|---|---|
| Sermon detail / Magazine article detail | Up to 1 hour |
| Home page | Up to 1 hour |
| About / Library / Books listing pages | Up to 24 hours |
| Search results | A few seconds (via Algolia) |

For urgent changes, an administrator can trigger an immediate refresh. Day-to-day editing doesn't require this.

> **A note on previews:** Preview mode is *not* affected by these caches. Drafts always show the latest content. The cache only applies to the public, published site.

---

## Roles and Permissions

Standard WordPress roles apply:

| Role | Can do |
|---|---|
| Administrator | Everything: install plugins, manage users, edit all content |
| Editor | Edit any post, page, or custom post type. Cannot install plugins or manage users. |
| Author | Create and edit their own posts. |
| Contributor | Submit posts for review (cannot publish directly). |
| Subscriber | Read access. Useful for paid/gated content (not currently used). |

For most content editors, the **Editor** role is the right level — full editing power without the risk of breaking the install.

---

## What Editors Don't Need to Worry About

Things that happen automatically and require no editor action:

- **Search index updates** — Algolia syncs in the background
- **Site rebuilds** — the public site refreshes on a schedule
- **Image optimization** — WordPress handles thumbnails / resizing
- **Mobile responsiveness** — the public site adapts on every screen size
- **SEO basics** — the public site renders proper meta tags and the right URLs
- **HTTPS / security** — handled by the hosting provider (WP Engine + Cloudflare)

---

## Common Tasks (Quick Reference)

**"I want to add a new sermon"**
→ Sermons → Add New. Fill in title, scripture reference, year, etc. Save Draft → Preview → Publish.

**"I want to change the footer quote"**
→ Site Settings → Footer tab → Quote field → Update.

**"I want to add a new milestone to the timeline"**
→ Site Settings → Timeline tab → "Add Milestone" → fill in year, title, description.

**"I want to upload a real painting for a tour stop"**
→ Tour Stops → click the stop → Painting Image field → upload or pick from Media Library → Update.

**"I want to add another card to the home page resources grid"**
→ Pages → Home → Resources tab → "Add Resource Card" → pick icon, fill in count, title, description, search-link target.

**"I want to add a new staff member"**
→ Library Staff → Add Staff Member. Title = name. Pick "Director" or "Research Assistant" layout.

---

## Where to Get Help

For content questions: contact your content manager / Interactive Supply.

For technical issues: WP Engine support handles the WordPress install; the frontend issues escalate to Interactive Supply.
