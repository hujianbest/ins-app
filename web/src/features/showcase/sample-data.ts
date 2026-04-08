import type {
  FeaturedPath,
  HomeHeroContent,
  HomePillar,
  PublicOpportunityPost,
  PublicProfile,
  PublicWork,
} from "./types";

export const homeHeroContent: HomeHeroContent = {
  label: "Full-screen visual impact",
  title: "Lens Archive",
  description:
    "A polished showcase for photographers and models to present standout work, publish booking intent, and turn attention into conversations.",
  primaryCta: {
    href: "/photographers/sample-photographer",
    label: "Explore photographer pages",
  },
  secondaryCta: {
    href: "/opportunities",
    label: "View active opportunities",
  },
};

export const homePageFeaturedPaths: FeaturedPath[] = [
  {
    href: "/photographers/sample-photographer",
    eyebrow: "Photographer",
    title: "Immersive portfolios for commissioned work",
    description:
      "Lead visitors from a cinematic landing page into signature frames, style notes, and booking intent.",
  },
  {
    href: "/models/sample-model",
    eyebrow: "Model",
    title: "Elegant talent pages with editorial presence",
    description:
      "Present look, profile, and visual identity in a clean gallery-led layout built for first impressions.",
  },
  {
    href: "/opportunities",
    eyebrow: "Opportunities",
    title: "Open calls for photographers and models",
    description:
      "Surface active city and schedule requests so collaborations can begin from a single public entry point.",
  },
];

export const homePagePillars: HomePillar[] = [
  {
    title: "Showcase",
    description:
      "Hero-led landing experiences with spacious composition, strong contrast, and gallery-first hierarchy.",
  },
  {
    title: "Engage",
    description:
      "Let viewers move from discovery into likes, favorites, and private in-site outreach.",
  },
  {
    title: "Book",
    description:
      "Connect active city and schedule requests with public profiles built to convert interest into bookings.",
  },
];

export const photographerProfiles: PublicProfile[] = [
  {
    slug: "sample-photographer",
    role: "photographer",
    name: "Avery Vale",
    city: "Shanghai",
    publishedAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-04T09:30:00Z",
    tagline: "Fashion and portrait photographer shaping cinematic commissions.",
    bio: "Avery builds bold, high-contrast portrait stories for editorials, personal branding, and collaborative booking work.",
    contactLabel: "Contact photographer",
    sectionTitle: "Featured Frames",
    sectionDescription: "A curated sequence of signature frames built to show mood, light control, and portrait range.",
    heroImageLabel: "Photographer cover composition",
    showcaseItems: [
      {
        workId: "neon-portrait-study",
        title: "Neon Portrait Study",
        subtitle: "Editorial portrait",
        description: "A low-key portrait set balancing cyan highlights with dense shadow for commission-led first impressions.",
      },
      {
        workId: "monochrome-street-session",
        title: "Monochrome Street Session",
        subtitle: "Personal series",
        description: "A disciplined black-and-white study focused on movement, posture, and expressive city texture.",
      },
      {
        workId: "studio-motion-casting",
        title: "Studio Motion Casting",
        subtitle: "Lookbook direction",
        description: "A clean studio sequence designed to demonstrate how movement can still feel premium and controlled.",
      },
    ],
  },
];

export const modelProfiles: PublicProfile[] = [
  {
    slug: "sample-model",
    role: "model",
    name: "Mika Rowan",
    city: "Hangzhou",
    publishedAt: "2026-04-02T10:00:00Z",
    updatedAt: "2026-04-05T08:15:00Z",
    tagline: "Editorial model with a clean, poised, camera-aware presence.",
    bio: "Mika presents a minimal, fashion-led profile shaped for portrait sessions, commercial mood boards, and concept shoots.",
    contactLabel: "Contact model",
    sectionTitle: "Editorial Highlights",
    sectionDescription: "A selective edit that shows styling range, posing control, and the ability to carry mood-driven sets.",
    heroImageLabel: "Model cover composition",
    showcaseItems: [
      {
        workId: "soft-light-editorial",
        title: "Soft Light Editorial",
        subtitle: "Beauty set",
        description: "A quiet close-up series built around skin texture, controlled gaze, and elegant styling restraint.",
      },
      {
        workId: "gallery-white-lookbook",
        title: "Gallery White Lookbook",
        subtitle: "Commercial profile",
        description: "A bright lookbook sequence that foregrounds silhouette, movement, and reliable camera confidence.",
      },
      {
        workId: "twilight-exterior-story",
        title: "Twilight Exterior Story",
        subtitle: "Concept portrait",
        description: "An evening set blending city atmosphere with calm posture and expressive line work.",
      },
    ],
  },
];

export function getPhotographerProfileBySlug(slug: string) {
  return photographerProfiles.find((profile) => profile.slug === slug);
}

export function getModelProfileBySlug(slug: string) {
  return modelProfiles.find((profile) => profile.slug === slug);
}

export function getProfileByRole(role: "photographer" | "model") {
  return role === "photographer" ? photographerProfiles[0] : modelProfiles[0];
}

export const works: PublicWork[] = [
  {
    id: "neon-portrait-study",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-04-05T18:00:00Z",
    title: "Neon Portrait Study",
    category: "Editorial portrait",
    description:
      "A low-key portrait set balancing cyan highlights with dense shadow for commission-led first impressions.",
    detailNote:
      "Built for art direction conversations where strong light control and immediate visual confidence need to come through at a glance.",
    contactLabel: "Contact photographer",
  },
  {
    id: "monochrome-street-session",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-03-30T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
    title: "Monochrome Street Session",
    category: "Personal series",
    description:
      "A disciplined black-and-white study focused on movement, posture, and expressive city texture.",
    detailNote:
      "Prepared to show documentary instinct and movement control without losing the premium framing expected in portrait-led commissions.",
    contactLabel: "Contact photographer",
  },
  {
    id: "studio-motion-casting",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-03-25T09:00:00Z",
    title: "Studio Motion Casting",
    category: "Lookbook direction",
    description:
      "A clean studio sequence designed to demonstrate how movement can still feel premium and controlled.",
    detailNote:
      "Built as a high-clarity lookbook reference that pairs movement with disciplined composition for brand-facing work.",
    contactLabel: "Contact photographer",
  },
  {
    id: "soft-light-editorial",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-04-04T11:00:00Z",
    updatedAt: "2026-04-05T13:00:00Z",
    title: "Soft Light Editorial",
    category: "Beauty set",
    description:
      "A quiet close-up series built around skin texture, controlled gaze, and elegant styling restraint.",
    detailNote:
      "Designed to present a beauty-forward mood board reference with calm posing and strong close-range presence.",
    contactLabel: "Contact model",
  },
  {
    id: "gallery-white-lookbook",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-03-28T10:00:00Z",
    title: "Gallery White Lookbook",
    category: "Commercial profile",
    description:
      "A bright lookbook sequence that foregrounds silhouette, movement, and reliable camera confidence.",
    detailNote:
      "Positioned as a commercial-facing sequence that shows consistency, clarity, and styling adaptability.",
    contactLabel: "Contact model",
  },
  {
    id: "twilight-exterior-story",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-03-21T10:00:00Z",
    title: "Twilight Exterior Story",
    category: "Concept portrait",
    description:
      "An evening set blending city atmosphere with calm posture and expressive line work.",
    detailNote:
      "Used to demonstrate mood-led exterior work where posture, rhythm, and ambient light all need to read clearly.",
    contactLabel: "Contact model",
  },
];

export function getWorkById(workId: string) {
  return works.find((work) => work.id === workId);
}

export function getWorksByRole(role: "photographer" | "model") {
  return works.filter((work) => work.ownerRole === role);
}

export const opportunityPosts: PublicOpportunityPost[] = [
  {
    id: "shanghai-editorial-casting",
    ownerSlug: "sample-photographer",
    ownerRole: "photographer",
    ownerName: "Avery Vale",
    publishedAt: "2026-04-03T08:00:00Z",
    updatedAt: "2026-04-05T07:30:00Z",
    title: "Shanghai editorial casting",
    city: "Shanghai",
    schedule: "2026-04-20 evening",
    summary:
      "Looking for a model comfortable with cinematic portrait direction, strong styling contrast, and a fast-moving editorial set in central Shanghai.",
    contactLabel: "Contact photographer",
  },
  {
    id: "hangzhou-beauty-collab",
    ownerSlug: "sample-model",
    ownerRole: "model",
    ownerName: "Mika Rowan",
    publishedAt: "2026-04-02T08:30:00Z",
    title: "Hangzhou beauty collaboration",
    city: "Hangzhou",
    schedule: "2026-04-27 afternoon",
    summary:
      "Seeking a photographer for a clean beauty-forward collaboration focused on soft light, restrained styling, and polished portfolio-ready close-ups.",
    contactLabel: "Contact model",
  },
];

export function getOpportunityPostById(postId: string) {
  return opportunityPosts.find((post) => post.id === postId);
}

export function getOpportunityPostsByRole(role: "photographer" | "model") {
  return opportunityPosts.filter((post) => post.ownerRole === role);
}
