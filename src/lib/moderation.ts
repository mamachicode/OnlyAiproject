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

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

function normalizeText(value: any) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_\-./\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasBlockedSfwTerm(text: string, term: string) {
  const normalizedTerm = normalizeText(term);

  if (!normalizedTerm) return false;

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(normalizedTerm)}($|[^a-z0-9])`,
    "i"
  );

  return pattern.test(text);
}

export function assertSafeText(values: any[]) {
  const combined = normalizeText(values.filter(Boolean).join(" "));

  const hit = BLOCKED_SFW_TERMS.find((term) =>
    hasBlockedSfwTerm(combined, term)
  );

  if (hit) {
    throw new Error(
      "Your text could not be saved. Keep it clean and try again."
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
    path.includes("not_") ||
    path.includes("no_");

  const hardBlockRules = [
    {
      label: "explicit sexual activity",
      threshold: 0.35,
      pattern:
        /(porn|genital|sexual_activity|sexual_act|explicit_nudity|exposed_genital|bare_breast|exposed_breast)/,
    },
    {
      label: "graphic injury",
      threshold: 0.70,
      pattern:
        /(graphic_gore|severe_blood|open_wound|fresh_wound|dismember|dismemberment|body_part|body_parts)/,
    },
    {
      label: "weapon content",
      threshold: 0.90,
      pattern: /(weapon|firearm|gun|knife)/,
    },
    {
      label: "offensive or restricted content",
      threshold: 0.80,
      pattern: /(hate|recreational_drug|hard_drug|drug_use)/,
    },
  ];

  const suggestiveRules = [
    {
      label: "suggestive presentation",
      threshold: 0.35,
      hardBlockThreshold: 0.90,
      pattern: /(sexual_display|erotica|suggestive)/,
    },
  ];

  let suggestiveReason = "";

  for (const score of scores) {
    if (safePath(score.path)) continue;

    const hardRule = hardBlockRules.find((item) =>
      item.pattern.test(score.path)
    );

    if (hardRule && score.value >= hardRule.threshold) {
      return {
        allowed: false,
        level: "blocked",
        reason: `${hardRule.label} flagged at ${score.path}=${score.value}`,
      };
    }

    const suggestiveRule = suggestiveRules.find((item) =>
      item.pattern.test(score.path)
    );

    if (suggestiveRule) {
      if (score.value >= suggestiveRule.hardBlockThreshold) {
        return {
          allowed: false,
          level: "blocked",
          reason: `${suggestiveRule.label} was extremely high at ${score.path}=${score.value}`,
        };
      }

      if (score.value >= suggestiveRule.threshold) {
        suggestiveReason =
          `${suggestiveRule.label} flagged at ${score.path}=${score.value}`;
      }
    }
  }

  if (suggestiveReason) {
    return {
      allowed: true,
      level: "suggestive",
      reason: suggestiveReason,
    };
  }

  return {
    allowed: true,
    level: "safe",
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
    const apiMessage =
      String(
        data?.error?.message ||
        data?.error?.type ||
        data?.message ||
        ""
      ).trim();

    const normalizedMessage = apiMessage.toLowerCase();

    const quotaReached =
      normalizedMessage.includes("amount of operations included in your plan") ||
      normalizedMessage.includes("rolling 30-day period") ||
      normalizedMessage.includes("usage limit") ||
      normalizedMessage.includes("quota reached") ||
      normalizedMessage.includes("quota exceeded");

    if (quotaReached) {
      console.warn("SIGHTENGINE_QUOTA_MANUAL_REVIEW", {
        status: res.status,
        filename,
        message: apiMessage,
      });

      return {
        allowed: true,
        level: "manual_review",
        reason: "Sightengine quota reached; manual review required",
      };
    }

    console.error("SIGHTENGINE_MODERATION_FAILURE", {
      status: res.status,
      error: data?.error || data?.message || data || null,
    });

    throw new Error(
      "Image safety checks are temporarily unavailable. Please try again later."
    );
  }

  const result = evaluateSightengineResult(data);

  if (!result.allowed) {
    console.error("SFW_IMAGE_BLOCKED_REASON", result.reason);

    throw new Error(
      "This upload contains explicit sexual content or nudity that isn't allowed on the OnlyAi SFW platform."
    );
  }

  if (result.level === "suggestive") {
    console.warn("SFW_IMAGE_SUGGESTIVE_WARNING", result.reason);
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

  const isImage = ALLOWED_IMAGE_MIMES.has(mime);
  const isVideo = ALLOWED_VIDEO_MIMES.has(mime);

  if (!isImage && !isVideo) {
    throw new Error("Only JPG, PNG, WebP, GIF, MP4, MOV, and WebM files are allowed.");
  }

  if (Number(file.size || 0) <= 0) {
    throw new Error("Upload file is empty.");
  }

  if (isImage && Number(file.size || 0) > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Max 20MB.");
  }

  if (isVideo && Number(file.size || 0) > MAX_VIDEO_BYTES) {
    throw new Error("Video is too large. Max 25MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const moderation = isImage
    ? await moderateImageWithSightengine({
        buffer,
        mime,
        filename,
      })
    : {
        allowed: true,
        level: "safe",
        reason: "video moderation not configured",
      };

  return {
    buffer,
    mime,
    filename,
    type: isVideo ? "VIDEO" : "IMAGE",
    resourceType: isVideo ? "video" : "image",
    moderation,
  };
}
