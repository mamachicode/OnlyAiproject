const BLOCKED_SFW_TERMS = [
  "nsfw",
  "nude",
  "naked",
  "explicit",
  "adult",
  "porn",
  "hentai",
  "boobs",
  "breasts",
  "cleavage",
  "ass",
  "butt",
  "thong",
  "bikini",
  "lingerie",
  "sweat",
  "caked",
  "sexy",
  "erotic",
  "fetish",
];

export function assertSafeText(fields: Array<string | undefined | null>) {
  const combined = fields
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hit = BLOCKED_SFW_TERMS.find((term) => combined.includes(term));

  if (hit) {
    throw new Error(
      "This upload appears to contain adult or suggestive content. OnlyAi currently allows SFW uploads only while the CCBill/NSFW lane is disabled."
    );
  }
}

export function assertSafeUploadMetadata(input: {
  caption?: string | null;
  filename?: string | null;
  contentType?: string | null;
}) {
  assertSafeText([input.caption, input.filename, input.contentType]);
}
