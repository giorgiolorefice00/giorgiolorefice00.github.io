import { defineCollection, z } from "astro:content";

// ── EXISTING (unchanged) ────────────────────────────────────────────────────

const events = defineCollection({
  type: "content",
  schema: z.object({
    venue: z.string(),
    city: z.string(),
    day: z.string(),
    month: z.string(),
    year: z.string(),
    eventTitle: z.string(),
    setTime: z.string(),
    serial: z.string().optional(),
    status: z.enum(["available", "few-left", "sold-out"]).default("available"),
    // extended for events page
    isPast: z.boolean().optional().default(false),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    tag: z.string().optional(), // archive display tag e.g. "peak time — 6h set"
  }),
});

const press = defineCollection({
  type: "content",
  schema: z.object({
    publication: z.string(),
    author: z.string(),
    date: z.string(),
  }),
});

const about = defineCollection({
  type: "content",
  schema: z.object({
    headlineLines: z.tuple([z.string(), z.string(), z.string()]),
    paragraphs: z.array(z.string()),
    stats: z.array(z.object({ num: z.string(), label: z.string() })),
    // extended for About page
    fullBio: z.array(z.string()).optional(),
    factFile: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    bornIn: z.string().optional(),
    basedIn: z.string().optional(),
    activeSince: z.string().optional(),
  }),
});

// ── NEW ─────────────────────────────────────────────────────────────────────

const achievements = defineCollection({
  type: "content",
  schema: z.object({
    year: z.string(),
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const residencies = defineCollection({
  type: "content",
  schema: z.object({
    venue: z.string(),
    city: z.string(),
    startYear: z.string(),
    endYear: z.string().optional(),
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
    title: z.string(),
    subtitle: z.string().optional(),
    releaseDate: z.string(),
    label: z.string(),
    format: z.enum(["EP", "Single", "Remix", "Album"]),
    description: z.string(),
    coverArt: z.string().optional(),
    tracklist: z.array(z.object({
      number: z.string(),
      title: z.string(),
      duration: z.string(),
    })).optional(),
    spotifyUrl: z.string().optional(),
    appleMusicUrl: z.string().optional(),
    bandcampUrl: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const mixes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    duration: z.string(),
    venue: z.string().optional(),
    date: z.string(),
    category: z.enum(["resident", "festival", "radio", "guest"]),
    coverArt: z.string().optional(),
    soundcloudUrl: z.string().optional(),
    mixcloudUrl: z.string().optional(),
    bpmRange: z.string(),
    genre: z.string(),
    featured: z.boolean().default(false),
  }),
});

const videos = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.enum(["music-video", "live-set", "aftermovie", "interview"]),
    youtubeId: z.string().optional(),
    vimeoId: z.string().optional(),
    duration: z.string(),
    date: z.string(),
    producer: z.string().optional(),
    thumbnail: z.string().optional(),
    meta: z.string(),
  }),
});

const photos = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    photographer: z.string(),
    date: z.string(),
    category: z.enum(["press", "live"]),
    venue: z.string().optional(),
    city: z.string().optional(),
    image: z.string().optional(),
    thumbnail: z.string().optional(),
    width: z.number(),
    height: z.number(),
    credit: z.string(),
    res: z.string().optional(),
  }),
});

export const collections = {
  events, press, about,
  achievements, residencies, partnerships,
  releases, mixes, videos, photos,
};
