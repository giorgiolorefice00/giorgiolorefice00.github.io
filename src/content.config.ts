import { defineCollection, z } from "astro:content";

// Helper for bilingual string fields
const bil = z.object({ en: z.string(), it: z.string() });

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
    bodyIt:      z.string().optional(), // Italian quote; body = English quote
  }),
});

const about = defineCollection({
  type: "content",
  schema: z.object({
    headlineLines: z.tuple([bil, bil, bil]),
    paragraphs:    z.array(bil),
    stats:         z.array(z.object({ num: z.string(), label: bil })),
    fullBio:       z.array(bil).optional(),
    factFile:      z.array(z.object({ label: bil, value: bil })).optional(),
    bornIn:      z.string().optional(),
    basedIn:     z.string().optional(),
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

const partnerships = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    type: z.enum(["brand", "festival"]),
    year: z.string().optional(),
  }),
});

const releases = defineCollection({
  type: "content",
  schema: z.object({
    title:       z.string(),
    subtitle:    z.string().optional(),
    releaseDate: dateStr,
    label:       z.string(),
    format:      z.enum(["EP", "Single", "Remix", "Album"]),
    description: bil,
    coverArt:    z.string().optional(),
    tracklist:   z.array(z.object({
      number:   z.string(),
      title:    z.string(),
      duration: z.string(),
    })).optional(),
    soundcloudUrl: z.string().optional(),
    spotifyUrl:    z.string().optional(),
    appleMusicUrl: z.string().optional(),
    bandcampUrl:   z.string().optional(),
    featured:      z.boolean().default(false),
  }),
});

const mixes = defineCollection({
  type: "content",
  schema: z.object({
    title:        z.string(),
    duration:     z.string(),
    venue:        z.string().optional(),
    date:         dateStr,
    category:     z.enum(["resident", "festival", "radio", "guest"]),
    coverArt:     z.string().optional(),
    soundcloudUrl: z.string().optional(),
    mixcloudUrl:   z.string().optional(),
    bpmRange:     z.string(),
    genre:        z.string(),
    featured:     z.boolean().default(false),
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

const siteConfig = defineCollection({
  type: "content",
  schema: z.object({
    socials: z.object({
      instagram:       z.string().optional(),
      soundcloud:      z.string().optional(),
      spotify:         z.string().optional(),
      appleMusic:      z.string().optional(),
      bandcamp:        z.string().optional(),
      youtubeMusic:    z.string().optional(),
      spotifyEmbedUrl:    z.string().optional(),
      appleMusicEmbedUrl: z.string().optional(),
      bandcampEmbedUrl:   z.string().optional(),
    }),
    contacts: z.object({
      management: z.object({
        name:  z.string(),
        email: z.string(),
        phone: z.string().optional(),
      }),
      bookingAgency: z.object({
        name:      z.string(),
        email:     z.string(),
        phone:     z.string().optional(),
        territory: bil,
      }),
      press: z.object({
        name:  z.string(),
        email: z.string(),
      }),
      generalEmail: z.string(),
    }),
    files: z.object({
      epk:            z.string().optional(),
      technicalRider: z.string().optional(),
      stagePlot:      z.string().optional(),
      pressPhotosZip: z.string().optional(),
    }),
  }),
});

const ui = defineCollection({
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
    cta: z.object({
      bookNow:          bil,
      listenLatest:     bil,
      viewTour:         bil,
      readFullStory:    bil,
      downloadEpk:      bil,
      sendInquiry:      bil,
      loadMore:         bil,
      allTourDates:     bil,
      tickets:          bil,
      soldOut:          bil,
      fewLeft:          bil,
      comingSoon:       bil,
      listenSpotify:    bil,
      listenSoundcloud: bil,
      listenBandcamp:   bil,
      listenApple:      bil,
      listen:           bil,
      streams:          bil,
      downloadAll:      bil,
    }),
    footer: z.object({
      sitemap:      bil,
      listen:       bil,
      follow:       bil,
      rights:       bil,
      brandPhrase1: bil,
      brandPhrase2: bil,
      privacy:      bil,
      terms:        bil,
      pressKit:     bil,
    }),
    misc: z.object({
      scroll:      bil,
      readMore:    bil,
      close:       bil,
      recorded:    bil,
      forBookings: bil,
      forPress:    bil,
      latestDrop:  bil,
    }),
    management: z.object({
      managementRole: bil,
      bookingRole:    bil,
      pressRole:      bil,
    }),
    forms: z.object({
      booking: z.object({
        name:         bil,
        email:        bil,
        eventType:    bil,
        eventDate:    bil,
        venue:        bil,
        budget:       bil,
        message:      bil,
        riderConsent: bil,
        privacyNote:  bil,
      }),
    }),
  }),
});

const pageContent = defineCollection({
  type: "content",
  schema: z.object({
    home: z.object({
      heroEyebrow:        bil,
      heroTaglineLeft:    bil,
      heroTaglineRight:   bil,
      heroPhotoCaption:   bil,
      aboutEyebrow:       bil,
      aboutLinkText:      bil,
      mixEyebrow:         bil,
      mixLatestDropLabel: bil,
      eventsHeading:      bil,
      eventsSubtitle:     bil,
      pressEyebrow:       bil,
      pressHeading1:      bil,
      pressHeading2:      bil,
    }),
    about: z.object({
      titleLine1:           bil,
      titleLine2:           bil,
      achievementsHeading:  bil,
      residenciesHeading:   bil,
      partnershipsHeading:  bil,
      pressArticlesHeading: bil,
      epkEyebrow:           bil,
      epkHeading:           bil,
      epkDescription:       bil,
      factFileLabel:        bil,
      downloadBio:          bil,
    }),
    music: z.object({
      titleLine1:                  bil,
      titleLine2:                  bil,
      latestReleaseEyebrow:        bil,
      latestReleaseSectionLabel:   bil,
      latestReleaseDateLabel:      bil,
      streamingHeading:            bil,
      streamingSubtitle:           bil,
      spotifyEmbedLabel:           bil,
      appleMusicEmbedLabel:        bil,
      productionNote:              bil,
      mixesHeading:                bil,
      mixesSubtitle:               bil,
      mixesFilterAllLabel:         bil,
      mixesFilterResidentLabel:    bil,
      mixesFilterFestivalLabel:    bil,
      mixesFilterRadioLabel:       bil,
      mixesFilterGuestLabel:       bil,
      discographyHeading:          bil,
      discographyEmptyStateMessage: bil,
      genreTagsLabel:              bil,
      genreTagsList:               bil,
      discographyYearHeader:       bil,
      discographyTitleHeader:      bil,
      discographyFormatHeader:     bil,
      discographyLabelHeader:      bil,
      discographyStreamsHeader:     bil,
    }),
    events: z.object({
      titleLine1:       bil,
      titleLine2:       bil,
      upcomingHeading:  bil,
      upcomingSubtitle: bil,
      mapHeading:       bil,
      archiveHeading:   bil,
      archiveSubtitle:  bil,
    }),
    media: z.object({
      titleLine1:          bil,
      titleLine2:          bil,
      pressPhotosHeading:  bil,
      pressPhotosSubtitle: bil,
      liveHeading:         bil,
      videoHeading:        bil,
    }),
    contact: z.object({
      titleLine1:           bil,
      titleLine2:           bil,
      bookingEyebrow:       bil,
      bookingHeading:       bil,
      bookingSubtitle:      bil,
      directContactHeading: bil,
      generalInquiryLine:   bil,
      generalInquiryNote:   bil,
      receiptTitle:         bil,
      receiptConfirm:       bil,
    }),
  }),
});

export const collections = {
  events, press, about,
  achievements, residencies, partnerships,
  releases, mixes, videos, photos,
  siteConfig, ui, pageContent,
};
