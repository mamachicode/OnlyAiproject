const BANNED_KEYWORDS = [
  "nsfw","xxx","porn","explicit","nude","nudity","sex","sexual",
  "fetish","onlyfans","blowjob","bj","cum","creampie","hardcore",
  "pussy","dick","cock","boobs","tits","naked","topless",
  "milf","anal","gangbang","escort","camgirl"
];

function normalize(input: string) {
  return (input || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

export function assertSafeText(fields: Array<string | undefined | null>) {
  const combined = fields.filter(Boolean).join(" ");
  const normalized = normalize(combined);

  const found = BANNED_KEYWORDS.filter(w => normalized.includes(w));

  if (found.length > 0) {
    throw new Error(`Blocked by moderation: ${found.slice(0,5).join(", ")}`);
  }
}
