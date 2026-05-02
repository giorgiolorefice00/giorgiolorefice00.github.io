import { defineCollection, z } from "astro:content";

// Helper for bilingual string fields
const bil = z.object({ en: z.string(), it: z.string() });

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
    date:        z.string(),
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
    releaseDate: z.string(),
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
    date:         z.string(),
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
    date:      z.string(),
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
    date:         z.string(),
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

export const collections = {
  events, press, about,
  achievements, residencies, partnerships,
  releases, mixes, videos, photos,
};
