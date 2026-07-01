// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function appUrl(req: NextRequest) {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.ONLYAI_APP_URL;

  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return new URL(req.url).origin.replace(/\/$/, "");
}

function formatMoney(cents: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency || "USD").toUpperCase(),
    }).format(Number(cents || 0) / 100);
  } catch {
    return `$${(Number(cents || 0) / 100).toFixed(2)}`;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function fetchWithTimeout(url: string, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "OnlyAi-Attention-Report/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkPage(baseUrl: string, label: string, path: string) {
  const url = new URL(path, `${baseUrl}/`).toString();
  const startedAt = Date.now();

  try {
    const res = await fetchWithTimeout(url);
    const ms = Date.now() - startedAt;
    const ok = res.status >= 200 && res.status < 400;

    return {
      label,
      path,
      url,
      ok,
      status: res.status,
      statusText: res.statusText,
      ms,
    };
  } catch (error) {
    return {
      label,
      path,
      url,
      ok: false,
      ms: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkPageWithRetry(
  baseUrl: string,
  label: string,
  path: string,
  attempts = 2
) {
  let lastResult = await checkPage(baseUrl, label, path);

  for (let attempt = 1; attempt < attempts; attempt += 1) {
    if (lastResult.ok) return lastResult;

    // Retry transient production/serverless failures, but do not retry 404-style misses.
    if (lastResult.status && lastResult.status < 500) return lastResult;

    await wait(750);
    lastResult = await checkPage(baseUrl, label, path);
  }

  return lastResult;
}

function buildTextReport(report: any) {
  const lines: string[] = [];

  lines.push("OnlyAi Attention Report");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Status: ${report.status}`);
  lines.push("");

  if (report.critical.length > 0) {
    lines.push("Critical:");
    report.critical.forEach((item: string) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (report.warnings.length > 0) {
    lines.push("Warnings:");
    report.warnings.forEach((item: string) => lines.push(`- ${item}`));
    lines.push("");
  }

  if (report.critical.length === 0 && report.warnings.length === 0) {
    lines.push("No action needed.");
    lines.push("");
  }

  lines.push("Revenue Pulse:");
  lines.push(`- Active subscribers: ${report.revenue.activeSubscribers}`);
  lines.push(`- New subscriptions in last 24h: ${report.revenue.newSubscriptions24h}`);
  lines.push(`- Canceled/expired in last 24h: ${report.revenue.canceledSubscriptions24h}`);
  lines.push(`- Estimated MRR: ${report.revenue.estimatedMrr}`);
  lines.push("");

  lines.push("Creator Snapshot:");
  if (report.creators.length === 0) {
    lines.push("- No SFW creators found.");
  } else {
    report.creators.slice(0, 12).forEach((creator: any) => {
      lines.push(
        `- @${creator.handle}: ${creator.activeSubscribers} active, ${creator.estimatedMrr} MRR, posts: ${creator.hasPosts ? "yes" : "no"}`
      );
    });
  }
  lines.push("");

  lines.push("Website Checks:");
  report.pageChecks.forEach((page: any) => {
    const result = page.ok ? "OK" : "BROKEN";
    const detail = page.error || `${page.status} ${page.statusText || ""}`.trim();
    lines.push(`- ${result}: ${page.path} (${detail}, ${page.ms}ms)`);
  });
  lines.push("");

  lines.push("Stripe Webhook Health:");
  lines.push(`- Events in last 24h: ${report.webhook.events24h}`);
  lines.push(`- Failed in last 24h: ${report.webhook.failed24h}`);
  report.webhook.recentFailures.forEach((failure: any) => {
    lines.push(`- ${failure.eventType}: ${failure.error || failure.status} at ${failure.receivedAt}`);
  });
  lines.push("");

  lines.push("Content Health:");
  lines.push(`- Posts without media: ${report.content.postsWithoutMedia}`);
  report.content.recentPostsWithoutMedia.forEach((post: any) => {
    lines.push(`- "${post.title}" by @${post.author} has no media (${post.createdAt})`);
  });

  if (report.info.length > 0) {
    lines.push("");
    lines.push("Info:");
    report.info.forEach((item: string) => lines.push(`- ${item}`));
  }

  return lines.join("\n");
}

async function sendReportEmail(report: any, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = String(process.env.ONLYAI_REPORT_TO || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  const from =
    process.env.ONLYAI_REPORT_FROM ||
    process.env.RESET_EMAIL_FROM ||
    "OnlyAi <support@weareonlyai.com>";

  if (!apiKey || to.length === 0) {
    console.warn("ONLYAI_REPORT_EMAIL_NOT_SENT", {
      hasResendApiKey: Boolean(apiKey),
      hasReportTo: to.length > 0,
    });

    return { sent: false, skipped: true };
  }

  const subjectPrefix =
    report.status === "OK" ? "✅" : report.status === "WARNING" ? "⚠️" : "🚨";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `${subjectPrefix} OnlyAi Attention Report: ${report.status}`,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.55;">
          <h2>OnlyAi Attention Report: ${escapeHtml(report.status)}</h2>
          <p style="color:#555;">Generated ${escapeHtml(report.generatedAt)}</p>
          <pre style="white-space:pre-wrap;background:#0f172a;color:#f8fafc;padding:16px;border-radius:12px;font-size:14px;line-height:1.5;">${escapeHtml(text)}</pre>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    console.error("ONLYAI_REPORT_EMAIL_ERROR", res.status, errorText);
    return { sent: false, skipped: false, status: res.status, error: errorText };
  }

  return { sent: true, skipped: false };
}

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return unauthorized("CRON_SECRET is not configured.");
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return unauthorized();
  }

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const baseUrl = appUrl(req);

  const activeSubscriptionWhere = {
    processor: "STRIPE",
    status: "ACTIVE",
    OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
  };

  const critical: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  let pageChecks = await Promise.all([
    checkPageWithRetry(baseUrl, "Homepage", "/"),
    checkPageWithRetry(baseUrl, "Creators", "/creators"),
    checkPageWithRetry(baseUrl, "Login", "/login"),
    checkPageWithRetry(baseUrl, "Signup", "/signup"),
  ]);

  const [
    creators,
    newSubscriptions24h,
    canceledSubscriptions24h,
    events24h,
    failedWebhookEvents,
    postsWithoutMedia,
    recentPostsWithoutMedia,
  ] = await Promise.all([
    prisma.creator.findMany({
      where: {
        classification: "SFW",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        handle: true,
        displayName: true,
        priceCents: true,
        currency: true,
        createdAt: true,
        subscriptions: {
          where: activeSubscriptionWhere,
          select: {
            id: true,
            startedAt: true,
            currentPeriodEnd: true,
          },
        },
        user: {
          select: {
            username: true,
            email: true,
            posts: {
              where: {
                isNsfw: false,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              select: {
                id: true,
                createdAt: true,
              },
            },
          },
        },
      },
    }),

    prisma.subscription.count({
      where: {
        ...activeSubscriptionWhere,
        startedAt: {
          gte: since24h,
        },
      },
    }),

    prisma.subscription.count({
      where: {
        processor: "STRIPE",
        status: {
          in: ["CANCELED", "EXPIRED"],
        },
        endedAt: {
          gte: since24h,
        },
      },
    }),

    prisma.webhookEvent.count({
      where: {
        processor: "STRIPE",
        receivedAt: {
          gte: since24h,
        },
      },
    }),

    prisma.webhookEvent.findMany({
      where: {
        processor: "STRIPE",
        receivedAt: {
          gte: since24h,
        },
        OR: [
          { status: "FAILED" },
          {
            error: {
              not: null,
            },
          },
        ],
      },
      orderBy: {
        receivedAt: "desc",
      },
      take: 10,
      select: {
        eventType: true,
        status: true,
        error: true,
        receivedAt: true,
      },
    }),

    prisma.post.count({
      where: {
        isNsfw: false,
        media: {
          none: {},
        },
      },
    }),

    prisma.post.findMany({
      where: {
        isNsfw: false,
        media: {
          none: {},
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        title: true,
        createdAt: true,
        author: {
          select: {
            username: true,
          },
        },
      },
    }),
  ]);

  const creatorPageChecks: any[] = [];

  for (const creator of creators) {
    const handle = creator.handle || creator.user?.username;

    if (!handle) {
      continue;
    }

    creatorPageChecks.push(
      await checkPageWithRetry(baseUrl, `Creator @${handle}`, `/public/creator/${handle}`)
    );

    await wait(150);

    creatorPageChecks.push(
      await checkPageWithRetry(baseUrl, `Subscribe @${handle}`, `/subscribe/${handle}`)
    );

    await wait(150);
  }

  pageChecks = [...pageChecks, ...creatorPageChecks];

  for (const page of pageChecks) {
    if (page.ok) continue;

    const detail =
      page.error || `${page.status || "NO_STATUS"} ${page.statusText || ""}`.trim();

    if (!page.status || page.status >= 500) {
      critical.push(`${page.label} is broken: ${page.path} (${detail})`);
    } else {
      warnings.push(`${page.label} needs attention: ${page.path} (${detail})`);
    }
  }

  const creatorRows = creators.map((creator: any) => {
    const activeSubscribers = creator.subscriptions.length;
    const priceCents = Number(creator.priceCents || 0);
    const currency = creator.currency || "USD";
    const latestPost = creator.user?.posts?.[0] || null;

    return {
      handle: creator.handle || creator.user?.username || "unknown",
      displayName: creator.displayName,
      activeSubscribers,
      price: formatMoney(priceCents, currency),
      estimatedMrr: formatMoney(activeSubscribers * priceCents, currency),
      estimatedMrrCents: activeSubscribers * priceCents,
      currency,
      hasPosts: Boolean(latestPost),
      latestPostAt: latestPost?.createdAt ? latestPost.createdAt.toISOString() : null,
      createdAt: creator.createdAt,
    };
  });

  const activeSubscribers = creatorRows.reduce(
    (sum: number, creator: any) => sum + creator.activeSubscribers,
    0
  );

  const estimatedMrrCents = creatorRows.reduce(
    (sum: number, creator: any) => sum + creator.estimatedMrrCents,
    0
  );

  const activeCreatorsWithNoPosts = creatorRows.filter(
    (creator: any) => creator.activeSubscribers > 0 && !creator.hasPosts
  );

  const newCreatorsWithNoPosts = creatorRows.filter(
    (creator: any) => !creator.hasPosts && creator.createdAt >= since7d
  );

  for (const creator of activeCreatorsWithNoPosts) {
    warnings.push(
      `@${creator.handle} has ${creator.activeSubscribers} active subscriber(s) but no public SFW posts.`
    );
  }

  for (const creator of newCreatorsWithNoPosts.slice(0, 5)) {
    warnings.push(`New creator @${creator.handle} has no SFW posts yet.`);
  }

  if (postsWithoutMedia > 0) {
    warnings.push(`${postsWithoutMedia} SFW post(s) have no media attached.`);
  }

  if (failedWebhookEvents.length > 0) {
    critical.push(
      `${failedWebhookEvents.length} Stripe webhook event(s) failed in the last 24 hours.`
    );
  }

  if (creators.length === 0) {
    warnings.push("No SFW creators were found in the database.");
  }

  if (activeSubscribers === 0) {
    info.push("No active Stripe subscribers found yet.");
  }

  const status =
    critical.length > 0 ? "CRITICAL" : warnings.length > 0 ? "WARNING" : "OK";

  const report = {
    generatedAt: now.toISOString(),
    windowStart: since24h.toISOString(),
    baseUrl,
    status,
    critical,
    warnings,
    info,
    revenue: {
      activeSubscribers,
      newSubscriptions24h,
      canceledSubscriptions24h,
      estimatedMrrCents,
      estimatedMrr: formatMoney(estimatedMrrCents, "USD"),
    },
    creators: creatorRows
      .sort(
        (a: any, b: any) =>
          b.activeSubscribers - a.activeSubscribers ||
          b.estimatedMrrCents - a.estimatedMrrCents
      )
      .map(({ estimatedMrrCents, currency, createdAt, ...creator }: any) => creator),
    pageChecks,
    webhook: {
      events24h,
      failed24h: failedWebhookEvents.length,
      recentFailures: failedWebhookEvents.map((event: any) => ({
        eventType: event.eventType,
        status: event.status,
        error: event.error,
        receivedAt: event.receivedAt.toISOString(),
      })),
    },
    content: {
      postsWithoutMedia,
      recentPostsWithoutMedia: recentPostsWithoutMedia.map((post: any) => ({
        title: post.title,
        author: post.author?.username || "unknown",
        createdAt: post.createdAt.toISOString(),
      })),
    },
  };

  const textReport = buildTextReport(report);

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const sendOkReports =
    process.env.ONLYAI_REPORT_SEND_OK === "true" ||
    req.nextUrl.searchParams.get("sendOk") === "1";

  const shouldSendEmail = !dryRun && (report.status !== "OK" || sendOkReports);
  const emailed = shouldSendEmail
    ? await sendReportEmail(report, textReport)
    : { sent: false, skipped: true };

  return NextResponse.json({
    ok: true,
    emailed,
    report,
  });
}
