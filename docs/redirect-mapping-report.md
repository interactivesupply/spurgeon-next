# spurgeon.org → spurgeon-next redirect mapping report

Generated 2026-05-19 from the wp-sitemap on spurgeon.org
plus WP-CLI dumps from spurgeonkc (legacy) and spurgeoncenter (new).

## Counts

| Bucket | Count |
|---|---|
| Legacy URLs in sitemap | 4144 |
| Redirects emitted | 4123 |
| Unmappable (skipped) | 21 |
| Ambiguous (skipped) | 0 |
| Identity (skipped — source === destination) | 0 |

## Legacy URL category breakdown (from sitemap)

| Category | Count |
|---|---|
| `sermons` | 3564 |
| `blog-entries` | 355 |
| `books` | 171 |
| `lectures` | 22 |
| `articles` | 19 |
| `tour` | 10 |
| `sermon-number` | 1 |

## Match mode breakdown (how each redirect was determined)

| Mode | Count |
|---|---|
| slug-unique | 3799 |
| books-catchall | 138 |
| slug+category | 72 |
| slug-numeric-suffix | 50 |
| title | 35 |
| source_url | 29 |

## Destination post type breakdown

| Post type | Count |
|---|---|
| `spurgeon_sermon` | 3553 |
| `spurgeon_blog` | 353 |
| `_books_catchall` | 138 |
| `magazine_article` | 28 |
| `conference_media` | 22 |
| `spurgeon_article` | 19 |
| `tour_stop` | 10 |

## 20 random redirects to spot-check

- `/resource-library/articles/bible-reading-and-prayer-in-the-marriage-of-charles-and-susie-spurgeon/` → `/articles/bible-reading-and-prayer-in-the-marriage-of-charles-and-susie-spurgeon`
- `/resource-library/articles/building-a-culture-of-evangelism/` → `/articles/building-a-culture-of-evangelism`
- `/resource-library/articles/dumb-dogs-in-the-pulpit-spurgeon-on-borrowed-sermons/` → `/articles/dumb-dogs-in-the-pulpit-spurgeon-on-borrowed-sermons`
- `/resource-library/articles/gods-pruning-and-the-branches/` → `/articles/gods-pruning-and-the-branches`
- `/resource-library/articles/how-do-we-serve-god-in-our-own-generation/` → `/articles/how-do-we-serve-god-in-our-own-generation`
- `/resource-library/articles/my-people-pray-for-me-how-spurgeon-asked-his-church-to-pray-for-him/` → `/articles/my-people-pray-for-me-how-spurgeon-asked-his-church-to-pray-for-him`
- `/resource-library/articles/preaching-advice-for-busy-pastors/` → `/articles/preaching-advice-for-busy-pastors`
- `/resource-library/articles/principles-from-spurgeons-sermon-preparation-process/` → `/articles/principles-from-spurgeons-sermon-prep-process`
- `/resource-library/articles/sermon-of-the-week-as-thy-days-so-shall-thy-strength-be/` → `/articles/sermon-of-the-week-as-thy-days-so-shall-thy-strength-be`
- `/resource-library/articles/soul-winning-c-s-lovett-vs-c-h-spurgeon/` → `/articles/soul-winning-c-s-lovett-vs-c-h-spurgeon`
- `/resource-library/articles/spurgeon-and-the-question-of-the-preaching-gown/` → `/articles/spurgeon-and-the-question-of-the-preaching-gown`
- `/resource-library/articles/spurgeons-associationalism-after-the-downgrade-controversy/` → `/articles/spurgeons-associationalism-after-the-downgrade-controversy`
- `/resource-library/articles/spurgeons-sermons-and-faithful-exposition/` → `/articles/the-new-park-street-pulpit-and-spurgeons-commitment-to-faithful-exposition`
- `/resource-library/articles/the-glorious-work-spurgeons-letter-to-the-colleges-first-missionary/` → `/articles/the-glorious-work-spurgeons-letter-to-the-first-college-missionary`
- `/resource-library/articles/the-great-difference-in-the-two-advents-of-christ/` → `/articles/the-great-difference-in-the-two-advents-of-christ`
- `/resource-library/articles/the-pastors-private-prayer/` → `/articles/the-pastors-private-prayer`
- `/resource-library/articles/the-queen-of-preachers-spurgeon-his-sister/` → `/articles/the-queen-of-preachers-spurgeon-his-sister-eliza-and-women-preachers`
- `/resource-library/articles/what-is-the-church-militant/` → `/articles/what-is-the-church-militant`
- `/resource-library/articles/who-shall-keep-the-keepers-churches-and-pastoral-accountability/` → `/articles/who-shall-keep-the-keepers-churches-and-pastoral-accountability`
- `/resource-library/blog-entries/10-lessons-from-spurgeon-on-luthers-life-and-ministry/` → `/blog/10-lessons-from-spurgeon-on-luthers-life-and-ministry`

## 10 sample URLs we couldn't map

Reasons include: no matching slug on new install, multiple ambiguous candidates,
or destination CPT has no per-post URL (e.g. orphaned book chapter without a known parent).

- `https://www.spurgeon.org/resource-library/sermons/christ-crucified-2/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/books/front-matter-3/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/books/general-index-to-vols-i-iv/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/books/evening-by-evening-full-text/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/books/hymns-for-morning-worship-in-the-family/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/books/hymns-for-family-worship-on-the-morning-of-the-lords-day/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/blog-entries/spurgeons-enduring-ministry-an-interview-with-christian-george/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/sermons/cheer-up-my-comrades-2/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/sermons/unprofitable-servants-2/`  _(no candidate)_
- `https://www.spurgeon.org/resource-library/sermons/the-blood-of-sprinkling-2/`  _(no candidate)_

## Notes

- We deliberately favour precision over recall. Better to leave a URL 404 than to redirect it wrong.
- Devotional CPTs (`morning_and_evening`, `faiths_check_book`) redirect to `/devotionals/<slug>`, which is a runtime resolver that 302s to the book reader with the right month/day query params.
- Tour stops all redirect to the single `/library/digital-tour` page (the new site has no per-stop URL).
- Book-chapter CPTs (autobiography, all_of_grace, etc.) redirect to the parent book reader at `/books/<book-slug>`. Chapter granularity is lost in these redirects.
