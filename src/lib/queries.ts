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
    devotionalEntries(
      first: 1
      where: {
        metaQuery: {
          metaArray: [
            { key: "devotional", value: "faiths_check_book", compare: EQUAL_TO }
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
        devotionalEntryFields {
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
    $devotional: String!
    $month: String!
    $day: String!
    $period: String
  ) {
    devotionalEntries(
      first: 1
      where: {
        metaQuery: {
          metaArray: [
            { key: "devotional", value: $devotional, compare: EQUAL_TO }
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
        devotionalEntryFields {
          scripture
          month
          day
          period
          devotional
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
        magazineArticleFields {
          author
          issue
          category
          coverImageUrl
          scriptureReference
        }
      }
    }
  }
`;

export const GET_BOOK_CHAPTER_BY_ID = gql`
  query GetBookChapterById($id: ID!) {
    bookChapter(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
      title
      content
      excerpt
      status
      bookChapterFields {
        book
        chapterNumber
      }
    }
  }
`;

/**
 * Like GET_BOOK_CHAPTERS but queries with `stati: [PUBLISH, DRAFT, PENDING]`
 * so unpublished chapters surface during preview rendering. The
 * authenticated proxy connection grants access; unauthenticated requests
 * still only see PUBLISH posts.
 */
export const GET_BOOK_CHAPTERS_PREVIEW = gql`
  query GetBookChaptersPreview($book: String!) {
    bookChapters(
      first: 200
      where: {
        stati: [PUBLISH, DRAFT, PENDING]
        metaQuery: {
          metaArray: [{ key: "book", value: $book, compare: EQUAL_TO }]
        }
      }
    ) {
      nodes {
        id
        databaseId
        title
        content
        excerpt
        status
        bookChapterFields {
          book
          chapterNumber
        }
      }
    }
  }
`;

export const GET_DEVOTIONAL_ENTRY_BY_ID = gql`
  query GetDevotionalEntryById($id: ID!) {
    devotionalEntry(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
      title
      content
      status
      devotionalEntryFields {
        scripture
        month
        day
        period
        devotional
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
      spurgeonBookFields {
        bookDescription
        bookCategoryLabel
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
    contentNode(id: $id, idType: DATABASE_ID) {
      databaseId
      slug
      contentType { node { name } }
      ... on BookChapter {
        bookChapterFields { book }
      }
      ... on DevotionalEntry {
        devotionalEntryFields { devotional }
      }
    }
  }
`;

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
      content
      excerpt
      magazineArticleFields {
        author
        issue
        category
        coverImageUrl
        scriptureReference
        bookTitle
        bookAuthor
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
      content
      excerpt
      magazineArticleFields {
        author
        issue
        category
        coverImageUrl
        scriptureReference
        bookTitle
        bookAuthor
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
      }
    }
    todayDevotional: devotionalEntries(
      first: 1
      where: {
        metaQuery: {
          metaArray: [
            { key: "devotional", value: "morning_and_evening", compare: EQUAL_TO }
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
        devotionalEntryFields { scripture }
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

export const GET_HOME_DATA = gql`
  query GetHomeData($month: String!, $day: String!) {
    todayDevotional: devotionalEntries(
      first: 1
      where: {
        metaQuery: {
          metaArray: [
            { key: "devotional", value: "morning_and_evening", compare: EQUAL_TO }
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
        devotionalEntryFields { scripture }
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
    page(id: "about", idType: URI) {
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
    page(id: "library", idType: URI) {
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
        spurgeonBookFields {
          bookDescription
          bookIcon
          bookCategoryLabel
          bookCategoryValue
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
  }
`;

export const GET_BOOK_BY_SLUG = gql`
  query GetBookBySlug($slug: ID!) {
    spurgeonBook(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      spurgeonBookFields {
        bookDescription
        bookCategoryLabel
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
