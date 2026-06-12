import { gql } from '@apollo/client';

export const GET_SERMON = gql`
  query GetSermon($slug: ID!) {
    sermon(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      content
      excerpt
      featuredImage { node { sourceUrl altText } }
      sermonFields {
        sermonNumber
        scriptureReference
        topic
        year
        datePreached
        notableQuote
        pdfUrl
        videoUrl
        thumbnailUrl
      }
      sermonCollections {
        nodes {
          slug
          name
        }
      }
    }
  }
`;

/**
 * Same shape as GET_SERMON but indexed by databaseId. Used during preview
 * mode (so a draft sermon — which has no published slug yet — can be
 * resolved by the numeric ID set in the preview cookie).
 */
export const GET_SERMON_BY_ID = gql`
  query GetSermonById($id: ID!) {
    sermon(id: $id, idType: DATABASE_ID, asPreview: true) {
      id
      databaseId
      title
      slug
      content
      excerpt
      featuredImage { node { sourceUrl altText } }
      sermonFields {
        sermonNumber
        scriptureReference
        topic
        year
        datePreached
        notableQuote
        pdfUrl
        videoUrl
        thumbnailUrl
      }
      sermonCollections {
        nodes {
          slug
          name
        }
      }
    }
  }
`;

export const GET_ALL_SERMON_SLUGS = gql`
  query GetAllSermonSlugs {
    sermons(first: 9999, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        slug
      }
    }
  }
`;

export const SPURGEON_SEARCH = gql`
  query SpurgeonSearch($search: String, $first: Int) {
    spurgeonSearch(search: $search, first: $first) {
      ... on Sermon {
        id
        databaseId
        title
        slug
        excerpt
        sermonFields {
          scriptureReference
          topic
          year
          datePreached
          sermonNumber
          notableQuote
          videoUrl
          thumbnailUrl
        }
        sermonCollections {
          nodes { slug name }
        }
      }
      ... on MagazineArticle {
        id
        databaseId
        title
        slug
        excerpt
        magazineArticleFields {
          author
          issue
          category
          scriptureReference
        }
      }
    }
  }
`;

export const GET_FCB_ENTRY = gql`
  query GetFCBEntry($month: String!, $day: String!) {
    faithsCheckBookEntries(
      first: 1
      where: {
        metaQuery: {
          metaArray: [
            { key: "month", value: $month, compare: EQUAL_TO }
            { key: "day", value: $day, compare: EQUAL_TO, type: NUMERIC }
          ]
          relation: AND
        }
      }
    ) {
      nodes {
        title
        content
        faithsCheckBookFields {
          scripture
          month
          day
        }
      }
    }
  }
`;

export const GET_DEVOTIONAL_ENTRY = gql`
  query GetDevotionalEntry(
    $month: String!
    $day: String!
    $period: String
  ) {
    morningAndEveningEntries(
      first: 1
      where: {
        metaQuery: {
          metaArray: [
            { key: "month", value: $month, compare: EQUAL_TO }
            { key: "day", value: $day, compare: EQUAL_TO, type: NUMERIC }
            { key: "period", value: $period, compare: EQUAL_TO }
          ]
          relation: AND
        }
      }
    ) {
      nodes {
        title
        content
        morningAndEveningFields {
          scripture
          month
          day
          period
        }
      }
    }
  }
`;

export const GET_TREASURY_VERSES = gql`
  query GetTreasuryVerses($psalm: String!) {
    treasuryEntries(
      first: 200
      where: {
        metaQuery: {
          metaArray: [
            { key: "psalm", value: $psalm, compare: EQUAL_TO, type: NUMERIC }
          ]
        }
      }
    ) {
      nodes {
        id
        content
        treasuryEntryFields {
          psalm
          verse
          verseText
          illustrations
        }
      }
    }
  }
`;

export const GET_MAGAZINE_ARTICLES = gql`
  query GetMagazineArticles(
    $search: String
    $first: Int
    $after: String
  ) {
    magazineArticles(
      first: $first
      after: $after
      where: {
        search: $search
        orderby: { field: DATE, order: DESC }
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        magazineCategories { nodes { slug name } }
        magazineArticleFields {
          author
          issue
          coverImageUrl
          scriptureReference
        }
      }
    }
    # All terms in the magazine_category taxonomy, used to render the filter
    # tabs dynamically (so adding a new category in wp-admin shows up here).
    magazineCategories(first: 50) {
      nodes { slug name count }
    }
  }
`;

export const GET_CONFERENCE_MEDIA_ITEM = gql`
  query GetConferenceMediaItem($slug: ID!) {
    conferenceMediaItem(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      content
      excerpt
      date
      featuredImage { node { sourceUrl altText } }
      conferenceMediaFields {
        speaker
        event
        sessionNumber
        year
        dateRecorded
        topic
        scriptureReference
        notableQuote
        pdfUrl
        videoUrl
        thumbnailUrl
        relatedResources { label url }
      }
    }
  }
`;

// Related conference-media items, scoped to the same `event` ACF value when
// the current item has one, or just the most recent items otherwise. Used for
// the "You may also like…" section on /conference-media/[slug]. Excludes the
// current item by databaseId on the client (WPGraphQL has no notIn arg here).
export const GET_RELATED_CONFERENCE_MEDIA = gql`
  query GetRelatedConferenceMedia($event: String!, $count: Int = 6) {
    conferenceMediaItems(
      first: $count
      where: {
        orderby: { field: DATE, order: DESC }
        metaQuery: { metaArray: [{ key: "event", value: $event, compare: EQUAL_TO }] }
      }
    ) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        featuredImage { node { sourceUrl altText } }
        conferenceMediaFields {
          speaker
          event
          year
          dateRecorded
          videoUrl
          thumbnailUrl
        }
      }
    }
  }
`;

// Fallback when the current item has no `event` set: pull the most recent
// conference-media items overall.
export const GET_RECENT_CONFERENCE_MEDIA = gql`
  query GetRecentConferenceMedia($count: Int = 6) {
    conferenceMediaItems(
      first: $count
      where: { orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        featuredImage { node { sourceUrl altText } }
        conferenceMediaFields {
          speaker
          event
          year
          dateRecorded
          videoUrl
          thumbnailUrl
        }
      }
    }
  }
`;

export const GET_CONFERENCE_MEDIA_ITEM_BY_ID = gql`
  query GetConferenceMediaItemById($id: ID!) {
    conferenceMediaItem(id: $id, idType: DATABASE_ID, asPreview: true) {
      id
      databaseId
      title
      slug
      content
      excerpt
      date
      featuredImage { node { sourceUrl altText } }
      conferenceMediaFields {
        speaker
        event
        sessionNumber
        year
        dateRecorded
        topic
        scriptureReference
        notableQuote
        pdfUrl
        videoUrl
        thumbnailUrl
        relatedResources { label url }
      }
    }
  }
`;

export const GET_BLOG_ENTRIES = gql`
  query GetBlogEntries(
    $search: String
    $first: Int
    $after: String
  ) {
    spurgeonBlogs(
      first: $first
      after: $after
      where: {
        search: $search
        orderby: { field: DATE, order: DESC }
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        date
        spurgeonBlogFields {
          author
          originalPublishDate
          scriptureReference
          featuredImageUrl
        }
      }
    }
  }
`;

export const GET_BLOG_ENTRY = gql`
  query GetBlogEntry($slug: ID!) {
    spurgeonBlog(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      content
      excerpt
      date
      spurgeonBlogFields {
        author
        originalPublishDate
        scriptureReference
        featuredImageUrl
      }
    }
  }
`;

export const GET_BLOG_ENTRY_BY_ID = gql`
  query GetBlogEntryById($id: ID!) {
    spurgeonBlog(id: $id, idType: DATABASE_ID, asPreview: true) {
      id
      databaseId
      title
      slug
      content
      excerpt
      date
      spurgeonBlogFields {
        author
        originalPublishDate
        scriptureReference
        featuredImageUrl
      }
    }
  }
`;

// GET_BOOK_CHAPTER_BY_ID and GET_BOOK_CHAPTERS_PREVIEW were removed when
// the unified `book_chapter` CPT was split into per-book CPTs (all_of_grace,
// lectures_students, around_wicket_gate, all_round_ministry, autobiography).
// The reader page now builds queries dynamically per book — see
// `chaptersQueryFor` and `chapterByIdQueryFor` in src/lib/books.ts.

export const GET_ARTICLE = gql`
  query GetArticle($slug: ID!) {
    spurgeonArticle(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      content
      excerpt
      date
      spurgeonArticleFields {
        author
        originalPublishDate
        scriptureReference
        featuredImageUrl
        sourceUrl
      }
    }
  }
`;

export const GET_ARTICLE_BY_ID = gql`
  query GetArticleById($id: ID!) {
    spurgeonArticle(id: $id, idType: DATABASE_ID, asPreview: true) {
      id
      databaseId
      title
      slug
      content
      excerpt
      date
      spurgeonArticleFields {
        author
        originalPublishDate
        scriptureReference
        featuredImageUrl
        sourceUrl
      }
    }
  }
`;

export const GET_ME_ENTRY_BY_ID = gql`
  query GetMorningAndEveningEntryById($id: ID!) {
    morningAndEveningEntry(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
      title
      content
      status
      morningAndEveningFields {
        scripture
        month
        day
        period
      }
    }
  }
`;

export const GET_FCB_ENTRY_BY_ID = gql`
  query GetFaithsCheckBookEntryById($id: ID!) {
    faithsCheckBookEntry(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
      title
      content
      status
      faithsCheckBookFields {
        scripture
        month
        day
      }
    }
  }
`;

export const GET_TREASURY_ENTRY_BY_ID = gql`
  query GetTreasuryEntryById($id: ID!) {
    treasuryEntry(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
      title
      content
      status
      treasuryEntryFields {
        psalm
        verse
        verseText
        illustrations
      }
    }
  }
`;

export const GET_TOUR_STOP_BY_ID = gql`
  query GetTourStopById($id: ID!) {
    tourStop(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
      title
      status
      tourStopFields {
        stopNumber
        subtitle
        paintingImage { node { sourceUrl altText } }
        paintingDescription
        narrative
        quote
      }
    }
  }
`;

export const GET_SPURGEON_BOOK_BY_ID = gql`
  query GetSpurgeonBookById($id: ID!) {
    spurgeonBook(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
      title
      slug
      content
      status
      bookCategories { nodes { slug name } }
      spurgeonBookFields {
        bookDescription
        bookChapterFilterSlug
        bookDestinationUrl
      }
    }
  }
`;

/**
 * Used by /api/preview to look up the routing-relevant fields for any post
 * type so we can build the right redirect URL. Type-conditional fragments
 * cover each CPT we route through preview.
 */
export const GET_PREVIEW_TARGET = gql`
  query GetPreviewTarget($id: ID!) {
    contentNode(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
      slug
      contentType { node { name } }
      # Per-book chapter CPTs (all_of_grace, autobiography, etc.) and the
      # devotional / treasury CPTs all route purely from contentType.node.name
      # and slug. No extra fragments needed.
    }
  }
`;

// Note: GET_BOOK_CHAPTERS was the legacy "all chapters of a book" query
// that filtered the unified `book_chapter` CPT by ACF `book` value. With
// per-book CPTs, the reader builds queries dynamically — see
// `chaptersQueryFor` in lib/books.ts. This query is retained only for any
// legacy code paths that haven't migrated yet.
export const GET_BOOK_CHAPTERS = gql`
  query GetBookChapters($book: String!) {
    bookChapters(
      first: 200
      where: {
        metaQuery: {
          metaArray: [{ key: "book", value: $book, compare: EQUAL_TO }]
        }
      }
    ) {
      nodes {
        id
        title
        content
        excerpt
        bookChapterFields {
          book
          chapterNumber
        }
      }
    }
  }
`;

export const GET_MAGAZINE_ARTICLE = gql`
  query GetMagazineArticle($slug: ID!) {
    magazineArticle(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      magazineCategories { nodes { slug name } }
      magazineArticleFields {
        author
        issue
        coverImageUrl
        scriptureReference
        bookTitle
        bookAuthor
        pdfUrl
      }
    }
  }
`;

export const GET_MAGAZINE_ARTICLE_BY_ID = gql`
  query GetMagazineArticleById($id: ID!) {
    magazineArticle(id: $id, idType: DATABASE_ID, asPreview: true) {
      id
      databaseId
      title
      slug
      magazineCategories { nodes { slug name } }
      magazineArticleFields {
        author
        issue
        coverImageUrl
        scriptureReference
        bookTitle
        bookAuthor
        pdfUrl
      }
    }
  }
`;

export const GET_HOME_PAGE_CONTENT = gql`
  query GetHomePageContent($month: String!, $day: String!) {
    spurgeonSettings {
      siteSettings {
        footerSignatureImage { node { sourceUrl altText } }
        footerAboutText
        footerQuote
        footerQuoteAuthor
        footerMbtsPursueLabel
        footerMbtsPursueUrl
        mbtsEyebrow
        mbtsHeading
        mbtsBody
        mbtsCtaLabel
        mbtsCtaUrl
        timelineEyebrow
        timelineHeading
        timelineMilestones {
          year
          title
          description
        }
      }
      navigationSettings {
        headerSpurgeonWorks {
          id label icon description ctaLabel ctaUrl
          links { label url }
        }
        headerCenterResources {
          id label icon description ctaLabel ctaUrl
          links { label url }
        }
        headerInlineLinks { label url }
        footerColumns {
          heading
          links { label url newTab }
        }
      }
    }
    page(id: "home", idType: URI) {
      homePageFields {
        heroEyebrow
        heroTitleTop
        heroTitleBottom
        heroBody
        heroBackgroundImage { node { sourceUrl altText } }
        heroSearchPlaceholder
        heroQuickSearches { term }
        statsItems {
          number
          label
          description
        }
        resourcesEyebrow
        resourcesHeading
        resourcesIntro
        resourcesItems {
          icon
          count
          title
          description
          resourceUrl
          searchTerm
        }
        libvisitEyebrow
        libvisitTitleTop
        libvisitTitleBottom
        libvisitBody1
        libvisitBody2
        libvisitImage { node { sourceUrl altText } }
        libvisitBadgeNumber
        libvisitBadgeCaption
        libvisitLocationLabel
        libvisitLocationLines
        libvisitHoursLabel
        libvisitHoursLines
        libvisitPrimaryLabel
        libvisitPrimaryUrl
        libvisitSecondaryLabel
        libvisitSecondaryUrl
        featuredSermons {
          nodes {
            __typename
            ... on Sermon {
              id
              databaseId
              title
              slug
              excerpt
              sermonFields { year notableQuote scriptureReference }
              sermonCollections { nodes { name } }
            }
            ... on SpurgeonArticle {
              id
              databaseId
              title
              slug
              excerpt
              spurgeonArticleFields { author originalPublishDate scriptureReference featuredImageUrl }
            }
            ... on SpurgeonBlog {
              id
              databaseId
              title
              slug
              excerpt
              spurgeonBlogFields { author originalPublishDate scriptureReference featuredImageUrl }
            }
            ... on MagazineArticle {
              id
              databaseId
              title
              slug
              excerpt
              magazineArticleFields { author issue scriptureReference }
            }
            ... on ConferenceMediaItem {
              id
              databaseId
              title
              slug
              excerpt
              conferenceMediaFields { speaker event year scriptureReference }
            }
          }
        }
      }
    }
    todayDevotional: morningAndEveningEntries(
      first: 1
      where: {
        metaQuery: {
          metaArray: [
            { key: "period", value: "morning", compare: EQUAL_TO }
            { key: "month", value: $month, compare: EQUAL_TO }
            { key: "day", value: $day, compare: EQUAL_TO, type: NUMERIC }
          ]
          relation: AND
        }
      }
    ) {
      nodes {
        title
        content
        morningAndEveningFields { scripture }
      }
    }
    latestSermons: sermons(first: 10, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        excerpt
        sermonFields { scriptureReference year }
      }
    }
    fallbackFeaturedSermons: sermons(first: 6, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        sermonFields { year notableQuote scriptureReference }
        sermonCollections { nodes { name } }
      }
    }
    featuredArticle: magazineArticles(first: 1, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { title slug excerpt }
    }
  }
`;

export const GET_HOME_DATA = gql`
  query GetHomeData($month: String!, $day: String!) {
    todayDevotional: morningAndEveningEntries(
      first: 1
      where: {
        metaQuery: {
          metaArray: [
            { key: "period", value: "morning", compare: EQUAL_TO }
            { key: "month", value: $month, compare: EQUAL_TO }
            { key: "day", value: $day, compare: EQUAL_TO, type: NUMERIC }
          ]
          relation: AND
        }
      }
    ) {
      nodes {
        title
        content
        morningAndEveningFields { scripture }
      }
    }
    latestSermons: sermons(first: 10, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        excerpt
        sermonFields { scriptureReference year }
      }
    }
    featuredSermons: sermons(first: 6, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        sermonFields { year notableQuote scriptureReference }
        sermonCollections { nodes { name } }
      }
    }
    featuredArticle: magazineArticles(first: 1, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { title slug excerpt }
    }
  }
`;

export const GET_ABOUT_PAGE_CONTENT = gql`
  query GetAboutPageContent {
    page(id: "about-content", idType: URI) {
      aboutPageFields {
        aboutHeroEyebrow
        aboutHeroTitleTop
        aboutHeroTitleBottom
        aboutHeroBody
        aboutHeroPortrait { node { sourceUrl altText } }
        aboutHeroPortraitCaption
        aboutVideoLabel
        aboutVideoUrl
        aboutSections {
          title
          body
          quote
          quoteAuthor
          floatsPortrait
        }
        aboutCaptionPortraitImage { node { sourceUrl altText } }
        aboutCaptionPortraitCaption
        aboutCtaHeading
        aboutCtaBody
        aboutCtaLabel
        aboutCtaUrl
      }
    }
  }
`;

export const GET_LIBRARY_PAGE_CONTENT = gql`
  query GetLibraryPageContent {
    page(id: "library-content", idType: URI) {
      libraryPageFields {
        libHeroEyebrow
        libHeroTitleTop
        libHeroTitleBottom
        libHeroBody
        libHeroBackground { node { sourceUrl altText } }
        libHeroPrimaryLabel
        libHeroSecondaryLabel
        libCarouselImages {
          image { node { sourceUrl altText } }
          alt
        }
        libVideoEyebrow
        libVideoHeading
        libVideoIntro
        libVideoUrl
        libTourEyebrow
        libTourHeading
        libTourBody
        libTourCtaLabel
        libVisitEyebrow
        libVisitHeading
        libVisitIntro
        libVisitLocationLines
        libVisitDirectionsUrl
        libVisitHours { label value }
        libVisitHoursNote
        libVisitPhone
        libVisitEmail
        libVisitExternalLabel
        libVisitExternalUrl
        libVisitMapEmbedUrl
        libPresEyebrow
        libPresHeading
        libPresPhoto { node { sourceUrl altText } }
        libPresQuote
        libPresAttribution
      }
    }
    tourStops(first: 10, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        tourStopFields { stopNumber }
      }
    }
    libraryStaffMembers(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        title
        libraryStaffFields {
          staffRole
          staffType
          staffAffiliation
          staffUrl
          staffPhoto { node { sourceUrl altText } }
        }
      }
    }
  }
`;

export const GET_TOUR_STOPS = gql`
  query GetTourStops {
    tourStops(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        id
        databaseId
        title
        slug
        tourStopFields {
          stopNumber
          subtitle
          paintingImage { node { sourceUrl altText } }
          paintingDescription
          narrative
          quote
        }
      }
    }
  }
`;

export const GET_LIBRARY_STAFF = gql`
  query GetLibraryStaff {
    libraryStaffMembers(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        id
        databaseId
        title
        libraryStaffFields {
          staffRole
          staffType
          staffAffiliation
          staffUrl
          staffPhoto { node { sourceUrl altText } }
        }
      }
    }
  }
`;

export const GET_BOOKS = gql`
  query GetBooks {
    spurgeonBooks(first: 50, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        id
        databaseId
        title
        slug
        bookCategories { nodes { slug name } }
        spurgeonBookFields {
          bookDescription
          bookIcon
          bookAccentColor
          bookIconBg
          bookIconColor
          bookCategoryColor
          bookDestinationUrl
          bookSubscribable
          bookChapterFilterSlug
        }
      }
    }
    # All terms in the book_category taxonomy, used to render the filter tabs
    # without hardcoding them in the frontend. Terms come back in WP creation
    # order (which is the order curated in the activation hook).
    bookCategories(first: 50) {
      nodes { slug name count }
    }
  }
`;

export const GET_BOOK_BY_SLUG = gql`
  query GetBookBySlug($slug: ID!) {
    spurgeonBook(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      bookCategories { nodes { slug name } }
      spurgeonBookFields {
        bookDescription
        bookChapterFilterSlug
        bookDestinationUrl
      }
    }
  }
`;

export const GET_READER_BOOK_SLUGS = gql`
  query GetReaderBookSlugs {
    spurgeonBooks(first: 50) {
      nodes {
        slug
        spurgeonBookFields {
          bookChapterFilterSlug
        }
      }
    }
  }
`;

export const FIND_SERMON_BY_BASE44_ID = gql`
  query FindSermonByLegacyId($base44Id: String!) {
    sermons(
      first: 1
      where: {
        metaQuery: {
          metaArray: [{ key: "_base44_id", value: $base44Id, compare: EQUAL_TO }]
        }
      }
    ) {
      nodes {
        slug
      }
    }
  }
`;
