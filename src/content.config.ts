import { defineCollection, z } from "astro:content";

// Helper for bilingual string fields
const bil = z.object({ en: z.string(), it: z.string() });

// Bilingual button: text (en/it) + optional destination URL
const bilBtn = z.object({ en: z.string(), it: z.string(), url: z.string().optional() });

// Accepts both YAML native dates (what Decap writes) and quoted strings, always outputs YYYY-MM-DD string
const dateStr = z.preprocess(
  (v) => v instanceof Date ? v.toISOString().split('T')[0] : v,
  z.string()
);

// ── EXISTING (schemas updated for i18n) ─────────────────────────────────────

const events = defineCollection({
  type: "content",
  schema: z.object({
    venue:      z.string(),
    city:       z.string(),
    day:        z.string(),
    month:      z.string(),
    year:       z.string(),
    eventTitle: bil,
    setTime:    z.string(),
    serial:     z.string().optional(),
    status:     z.enum(["available", "few-left", "sold-out"]).default("available"),
    isPast:     z.boolean().optional().default(false),
    latitude:   z.number().optional(),
    longitude:  z.number().optional(),
    tag:        bil.optional(),
  }),
});

const press = defineCollection({
  type: "content",
  schema: z.object({
    publication: z.string(),
    author:      z.string(),
    date:        dateStr,
    bodyIt:      z.string().optional(), // Italian quote; markdown body = English quote
    sourceUrl:   z.string().optional(),
    featured:    z.boolean().default(true),
  }),
});

const about = defineCollection({
  type: "content",
  schema: z.object({
    fullBio:   z.array(bil).optional(),
    factFile:  z.array(z.object({ label: bil, value: bil })).optional(),
    bornIn:    z.string().optional(),
    basedIn:   z.string().optional(),
    activeSince: z.string().optional(),
  }),
});

// ── NEW ─────────────────────────────────────────────────────────────────────

const achievements = defineCollection({
  type: "content",
  schema: z.object({
    year:        z.string(),
    title:       bil,
    description: bil,
    order:       z.number(),
  }),
});

const residencies = defineCollection({
  type: "content",
  schema: z.object({
    venue:     z.string(),
    city:      z.string(),
    startYear: z.string(),
    endYear:   z.string().optional(),
  }),
});


const releases = defineCollection({
  type: "content",
  schema: z.object({
    title:         bil,
    year:          z.number(),
    format:        z.enum(["EP", "Single", "Remix", "Album"]),
    label:         z.string(),
    soundcloudUrl: z.string().optional(),
  }),
});

const mixes = defineCollection({
  type: "content",
  schema: z.object({
    title:        z.string(),
    duration:     z.string(),
    date:         dateStr,
    category:     z.enum(["single", "live", "collab"]),
    coverArt:     z.string().optional(),
    soundcloudUrl:    z.string().optional(),
    spotifyUrl:       z.string().optional(),
    youtubeMusicUrl:  z.string().optional(),
    tracklistUrl:     z.string().optional(),
    featured:         z.boolean().default(false),
  }),
});

const videos = defineCollection({
  type: "content",
  schema: z.object({
    title:     bil,
    category:  z.enum(["music-video", "live-set", "aftermovie", "interview"]),
    youtubeId: z.string().optional(),
    vimeoId:   z.string().optional(),
    duration:  z.string(),
    date:      dateStr,
    producer:  z.string().optional(),
    thumbnail: z.string().optional(),
    meta:      bil,
  }),
});

const photos = defineCollection({
  type: "content",
  schema: ({ image: img }) => z.object({
    title:        z.string(),
    photographer: z.string(),
    date:         dateStr,
    category:     z.enum(["press", "live"]),
    venue:        z.string().optional(),
    city:         z.string().optional(),
    image:        img().optional(),
    thumbnail:    z.string().optional(),
    width:        z.number().optional(),
    height:       z.number().optional(),
    credit:       z.string(),
    res:          z.string().optional(),
  }),
});

const musicStreaming = defineCollection({
  type: "content",
  schema: z.object({
    spotifyEmbedUrl:    z.string().optional(),
    appleMusicEmbedUrl: z.string().optional(),
    bandcampEmbedUrl:   z.string().optional(),
    streamingHeading:            bil,
    streamingSubtitle:           bil,
    spotifyEmbedLabel:           bil,
    appleMusicEmbedLabel:        bil,
    streamingComingSoonMessage:  bil,
    productionNote:              bil,
  }),
});

const musicText = defineCollection({
  type: "content",
  schema: z.object({
    titleLine1:                  bil,
    titleLine2:                  bil,
    latestReleaseEyebrow:        bil,
    latestReleaseSectionLabel:   bil,
    latestReleaseDateLabel:      bil,
    mixesHeading:                bil,
    mixesSubtitle:               bil,
    mixesFilterAllLabel:         bil,
    mixesFilterSingleLabel:      bil,
    mixesFilterLiveLabel:        bil,
    mixesFilterCollabLabel:      bil,
    albumsHeading:          bil,
    albumsEmptyStateMessage: bil,
    genreTagsLabel:              bil,
    genreTagsList:               bil,
    albumsYearHeader:       bil,
    albumsTitleHeader:      bil,
    albumsFormatHeader:     bil,
    albumsLabelHeader:      bil,
    albumsStreamsHeader:     bil,
    listen:                  bil,
  }),
});

const siteConfig = defineCollection({
  type: "content",
  schema: z.object({
    socials: z.object({
      instagram:    z.string().optional(),
      soundcloud:   z.string().optional(),
      spotify:      z.string().optional(),
      appleMusic:   z.string().optional(),
      bandcamp:     z.string().optional(),
      youtubeMusic: z.string().optional(),
    }),
    contacts: z.object({
      email: z.string(),
      phone: z.string(),
    }),
    files: z.object({
      epk:            z.string().optional(),
      technicalRider: z.string().optional(),
      stagePlot:      z.string().optional(),
      pressPhotosZip: z.string().optional(),
    }),
  }),
});

const headerText = defineCollection({
  type: "content",
  schema: z.object({
    nav: z.object({
      home:    bil,
      about:   bil,
      music:   bil,
      events:  bil,
      media:   bil,
      contact: bil,
    }),
  }),
});

const footerText = defineCollection({
  type: "content",
  schema: z.object({
    brandPhrase1: bil,
    brandPhrase2: bil,
    sitemap:      bil,
    listen:       bil,
    follow:       bil,
    rights:       bil,
    privacy:      bil,
    terms:        bil,
    pressKit:     bil,
  }),
});

// ── HOME PAGE TEXT (one collection per section) ─────────────────────────────

const homeHero = defineCollection({
  type: "content",
  schema: z.object({
    heroEyebrow:       bil,
    heroTaglineLeft:   bil,
    heroTaglineRight:  bil,
    heroPhotoCaption:  bil,
    heroCtaPrimary:    bilBtn,
    heroCtaSecondary:  bilBtn,
    heroScroll:        bil,
  }),
});

const homeAbout = defineCollection({
  type: "content",
  schema: z.object({
    aboutEyebrow:    bil,
    aboutLinkText:   bil,
    headlineLine1:   bil,
    headlineLine2:   bil,
    headlineLine3:   bil,
    paragraphs:      z.array(bil),
    stats:           z.array(z.object({ num: z.string(), label: bil })),
  }),
});

const homeMix = defineCollection({
  type: "content",
  schema: z.object({
    mixEyebrow:         bil,
    mixLatestDropLabel: bil,
    listenSpotify:      bil,
    listenSoundcloud:   bil,
    listenYoutubeMusic: bil,
  }),
});

const homeEvents = defineCollection({
  type: "content",
  schema: z.object({
    eventsHeading:       bil,
    eventsSubtitle:      bil,
    allTourDates:        bilBtn,
    eventsCardCtaLabel:  bil,
  }),
});

const homePress = defineCollection({
  type: "content",
  schema: z.object({
    pressEyebrow:  bil,
    pressHeading1: bil,
    pressHeading2: bil,
  }),
});

// ── INNER PAGE TEXT ──────────────────────────────────────────────────────────

const aboutText = defineCollection({
  type: "content",
  schema: z.object({
    titleLine1:           bil,
    titleLine2:           bil,
    achievementsHeading:  bil,
    residenciesHeading:   bil,
    pressArticlesHeading: bil,
    factFileLabel:        bil,
    downloadBio:          bil,
  }),
});

const eventsText = defineCollection({
  type: "content",
  schema: z.object({
    titleLine1:       bil,
    titleLine2:       bil,
    upcomingHeading:  bil,
    upcomingSubtitle: bil,
    mapHeading:       bil,
    archiveHeading:   bil,
    archiveSubtitle:  bil,
  }),
});

const mediaText = defineCollection({
  type: "content",
  schema: z.object({
    titleLine1:          bil,
    titleLine2:          bil,
    pressPhotosHeading:  bil,
    pressPhotosSubtitle: bil,
    liveHeading:         bil,
    videoHeading:        bil,
  }),
});

const contactText = defineCollection({
  type: "content",
  schema: z.object({
    titleLine1:        bil,
    titleLine2:        bil,
    contactEyebrow:    bil,
    contactIntroLine:  bil.optional(),
    emailLabel:        bil.optional(),
    phoneLabel:        bil.optional(),
    contactNote:       bil.optional(),
  }),
});

const latestRelease = defineCollection({
  type: "content",
  schema: z.object({
    title:          bil,
    description:    bil.optional(),
    releaseDate:    dateStr,
    coverArt:       z.string().optional(),
    soundcloudUrl:  z.string().optional(),
    youtubeMusicUrl: z.string().optional(),
    tracklist:      z.array(z.object({
      number:   z.coerce.number(),
      title:    bil,
      duration: z.string(),
    })).optional(),
  }),
});

export const collections = {
  events, press, about,
  achievements, residencies,
  releases, mixes, videos, photos,
  siteConfig, headerText, footerText,
  musicStreaming, musicText,
  latestRelease,
  homeHero, homeAbout, homeMix, homeEvents, homePress,
  aboutText, eventsText, mediaText, contactText,
};
