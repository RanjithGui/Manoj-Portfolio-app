// Every word and media path on the site lives here. Replace the placeholder
// copy with Manoj's own; drop media into apps/web/public/media and point the
// optional `figure` fields at it (transparent PNG/WebP or alpha WebM).

export type Art =
  | "planet"
  | "figure"
  | "car"
  | "controller"
  | "flow"
  | "sound"
  | "food"
  | "peak"
  | "room"
  | "ring"
  | "wind"
  | "leaf";

export const content = {
  name: "MANOJ",
  role: "Designer & Developer",
  email: "hello@manoj.design",

  nav: [
    { label: "Universe", href: "#universe" },
    { label: "Journey", href: "#journey" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    eyebrow: "Welcome to my world",
    chipLeft: "Creator Manoj",
    chipRight: "Visionary",
    // e.g. "/media/manoj-hero.webp" — a cut-out portrait that stands in front of the wordmark
    figure: undefined as string | undefined,
  },

  universe: {
    kicker: "Chapter 02",
    title: "My Creative Universe",
    line: "The tools I think with — one system, always in motion.",
    tools: [
      { name: "Figma", mark: "Fg", tint: "#ff7262" },
      { name: "Photoshop", mark: "Ps", tint: "#31a8ff" },
      { name: "Illustrator", mark: "Ai", tint: "#ff9a00" },
      { name: "After Effects", mark: "Ae", tint: "#9999ff" },
      { name: "Premiere", mark: "Pr", tint: "#ea77ff" },
      { name: "Framer", mark: "Fr", tint: "#0099ff" },
      { name: "Webflow", mark: "Wf", tint: "#4353ff" },
      { name: "Spline", mark: "Sp", tint: "#ff5fa2" },
      { name: "React", mark: "Re", tint: "#61dafb" },
      { name: "Blender", mark: "Bl", tint: "#f5792a" },
      { name: "Notion", mark: "No", tint: "#e8e8e8" },
      { name: "Claude", mark: "Cl", tint: "#d97757" },
    ],
  },

  journey: {
    title: ["A", "Journey", "Through", "Time"],
    themes: ["Ideas", "Experiences", "People", "Projects", "Me"],
    hint: ["Move", "across", "the years"],
    footLeft: ["Same", "curiosity", "a brighter", "tomorrow"],
    footRight: ["Still", "designing", "what's", "next"],
    figure: undefined as string | undefined,
    years: [
      { year: 2021, title: "Beginning", lines: ["New city", "New chapter", "Bigger dreams"], scene: "desk" },
      { year: 2022, title: "Exploration", lines: ["Learned design", "Tried everything", "Found direction"], scene: "screen" },
      { year: 2023, title: "Practice", lines: ["Built skills", "Made projects", "Kept going"], scene: "studio" },
      { year: 2024, title: "Growth", lines: ["Real clients", "Real teams", "Real learning"], scene: "people" },
      { year: 2025, title: "Momentum", lines: ["Shipped products", "Solved problems", "Stepped up"], scene: "launch" },
      { year: 2026, title: "Next Chapter", lines: ["Bigger goals", "More impact", "Still designing"], scene: "city" },
    ],
  },

  projects: {
    label: "Projects",
    themes: ["Ideas", "Interfaces", "Experiences", "Real impact"],
    hint: ["Scroll", "Explore", "Interact"],
    footLeft: ["Real", "projects", "real", "stories"],
    footRight: ["Designing", "a brighter", "tomorrow"],
    figure: undefined as string | undefined,
    items: [
      { title: "Beyond Every Horizon", tag: "Ideas, interfaces, real impact.", art: "planet" as Art, url: "#" },
      { title: "Stories That Stay", tag: "Design that outlives trends.", art: "figure" as Art, url: "#" },
      { title: "Engineered Emotion", tag: "Turning ideas into motion.", art: "car" as Art, url: "#" },
      { title: "Play Starts Here", tag: "Play. Compete. Belong.", art: "controller" as Art, url: "#" },
      { title: "Motion With Meaning", tag: "Design. Animate. Inspire.", art: "flow" as Art, url: "#" },
      { title: "Sound You Can See", tag: "Music for the eyes.", art: "sound" as Art, url: "#" },
      { title: "Taste Every Moment", tag: "Food, warmth, good moods.", art: "food" as Art, url: "#" },
      { title: "Go Further North", tag: "Travel. Explore. Belong.", art: "peak" as Art, url: "#" },
      { title: "Shape Your Space", tag: "Interiors with intent.", art: "room" as Art, url: "#" },
      { title: "Build. Break. Repeat", tag: "A creator's playground.", art: "ring" as Art, url: "#" },
      { title: "Cleaner Tomorrows", tag: "Sustainable ideas, clearly told.", art: "wind" as Art, url: "#" },
      { title: "Little Green Habits", tag: "Small steps, big change.", art: "leaf" as Art, url: "#" },
    ],
  },

  finale: {
    topLeft: ["Ideas", "Designs", "Experiences", "Real impact"],
    topRight: ["Same", "passion", "a brighter", "tomorrow"],
    quote: ["Good", "design", "speaks", "quietly."],
    bottomLeft: ["A", "designer's", "world"],
    bottomRight: ["Design", "Build", "Explore", "Repeat"],
    figure: undefined as string | undefined,
    cta: "Let's build something unforgettable.",
    socials: [
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Behance", href: "#" },
      { label: "Dribbble", href: "#" },
    ],
  },
};
