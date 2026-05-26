// @ts-nocheck

const BLOCKED_SFW_TERMS = [
  "nsfw",
  "nude",
  "nudity",
  "explicit",
  "adult",
  "porn",
  "xxx",
  "fetish",
  "hardcore",
  "onlyfans",
  "only fans",
  "18+",
  "sex",
  "sexual",
  "topless",
  "lingerie",
  "erotic",
  "hentai",
];

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

function normalizeText(value: any) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_\-./\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function assertSafeText(values: any[]) {
  const combined = normalizeText(values.filter(Boolean).join(" "));

  const hit = BLOCKED_SFW_TERMS.find((term) =>
    combined.includes(normalizeText(term))
  );

  if (hit) {
    throw new Error(
      "This post cannot be uploaded in the Stripe SFW lane. Please use neutral text and SFW content."
    );
  }
}

function getFileName(file: any) {
  return String(file?.name || "upload").trim() || "upload";
}

function getMime(file: any) {
  return String(file?.type || "application/octet-stream").toLowerCase();
}

function getNumericScores(input: any, prefix = "") {
  const scores: { path: string; value: number }[] = [];

  if (!input || typeof input !== "object") return scores;

  for (const [key, value] of Object.entries(input)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "number" && Number.isFinite(value)) {
      scores.push({ path: path.toLowerCase(), value });
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      scores.push(...getNumericScores(value, path));
    }
  }

  return scores;
}

function evaluateSightengineResult(data: any) {
  const scores = getNumericScores(data);

  const safePath = (path: string) =>
    path.includes(".none") ||
    path.endsWith(".none") ||
    path.includes(".context.") ||
    path.startsWith("context.") ||
    path.includes("safe") ||
    path.includes("not_") ||
    path.includes("no_");

  const rules = [
    {
      // Hard Stripe-SFW block: explicit sexual/nude content.
      // Keep this strict.
      label: "explicit sexual or nudity content",
      threshold: 0.35,
      pattern:
        /(nudity|nude|explicit|erotica|porn|genital|sexual_activity|sexual_display|sexual_act|exposed|bare_breast|bare_chest)/,
    },
    {
      label: "gore or graphic violence",
      threshold: 0.45,
      pattern: /(gore|graphic|blood|wound|corpse|weapon|violence)/,
    },
    {
      label: "offensive or restricted content",
      threshold: 0.65,
      pattern: /(offensive|hate|drug|weapon|recreational_drug)/,
    },
  ];

  for (const score of scores) {
    if (safePath(score.path)) continue;

    const rule = rules.find((item) => item.pattern.test(score.path));

    if (rule && score.value >= rule.threshold) {
      return {
        allowed: false,
        reason: `${rule.label} flagged at ${score.path}=${score.value}`,
      };
    }
  }

  return {
    allowed: true,
    reason: "passed",
  };
}

async function moderateImageWithSightengine({
  buffer,
  mime,
  filename,
}: {
  buffer: Buffer;
  mime: string;
  filename: string;
}) {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!apiUser || !apiSecret) {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.SFW_ALLOW_UNMODERATED_LOCAL_UPLOADS === "true"
    ) {
      return {
        allowed: true,
        reason: "local moderation bypass",
      };
    }

    throw new Error(
      "Image moderation is not configured. Add SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET before allowing uploads."
    );
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: mime });

  form.append("media", blob, filename);
  form.append(
    "models",
    process.env.SIGHTENGINE_MODELS || "nudity-2.1,gore-2.0,offensive,weapon,recreational_drug"
  );
  form.append("api_user", apiUser);
  form.append("api_secret", apiSecret);

  const res = await fetch("https://api.sightengine.com/1.0/check.json", {
    method: "POST",
    body: form,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.status === "failure") {
    console.error("SIGHTENGINE_MODERATION_FAILURE", data);
    throw new Error("Image moderation failed. Upload blocked for safety.");
  }

  const result = evaluateSightengineResult(data);

  if (!result.allowed) {
    console.error("SFW_IMAGE_BLOCKED_REASON", result.reason);

    throw new Error(
      "This image is not allowed in the Stripe SFW lane. Please upload clearly SFW content."
    );
  }

  return result;
}

export async function prepareSafeUploadFile(file: any) {
  if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
    throw new Error("Invalid upload file.");
  }

  const filename = getFileName(file);
  const mime = getMime(file);

  assertSafeText([filename, mime]);

  if (mime.startsWith("video/")) {
    throw new Error(
      "Video uploads are disabled in the Stripe SFW lane until video moderation is connected."
    );
  }

  if (!ALLOWED_IMAGE_MIMES.has(mime)) {
    throw new Error("Only JPG, PNG, WebP, and GIF images are allowed in the SFW lane.");
  }

  if (Number(file.size || 0) <= 0) {
    throw new Error("Upload file is empty.");
  }

  if (Number(file.size || 0) > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Max 20MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await moderateImageWithSightengine({
    buffer,
    mime,
    filename,
  });

  return {
    buffer,
    mime,
    filename,
  };
}
