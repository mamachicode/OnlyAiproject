import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import crypto from "crypto";

function md5Hex(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

/**
 * Best-effort verification:
 * - If CCBill sends a digest-style value, we validate it using CCBILL_WEBHOOK_SALT.
 * - If no digest is present, and REQUIRE_VERIFY=true, we reject.
 *
 * NOTE: CCBill implementations vary depending on which event/version you enable.
 * Keep this strict for production and loosen only if your CCBill payload truly doesn't include a verifiable digest.
 */
function verifyCcbill(params: URLSearchParams) {
  const salt = process.env.CCBILL_WEBHOOK_SALT || "";
  const requireVerify = (process.env.CCBILL_WEBHOOK_REQUIRE_VERIFY || "true").toLowerCase() === "true";

  // Common identifiers
  const subscriptionId = params.get("subscriptionId") || "";
  const transactionId = params.get("transactionId") || "";
  const eventType = params.get("eventType") || params.get("event") || "";

  // Some CCBill flows use a digest computed from subscriptionId + approvedFlag + salt (doc patterns in ecosystem).
  // We support multiple possible field names to avoid brittleness.
  const providedDigest =
    params.get("digest") ||
    params.get("md5Digest") ||
    params.get("hash") ||
    params.get("verificationDigest") ||
    "";

  const approvedFlag =
    params.get("approved") ||
    params.get("isApproved") ||
    params.get("success") ||
    params.get("status") || ""; // last resort

  // If they provided a digest and we have salt + subscriptionId, verify
  if (providedDigest && salt && subscriptionId) {
    // Try a few common concatenation patterns (CCBill integrations vary by module/version)
    const candidates = [
      md5Hex(`${subscriptionId}${approvedFlag}${salt}`),
      md5Hex(`${subscriptionId}1${salt}`),
      md5Hex(`${subscriptionId}0${salt}`),
      md5Hex(`${subscriptionId}${salt}`),
      md5Hex(`${transactionId}${salt}`),
    ].map(s => s.toLowerCase());

    const ok = candidates.includes(providedDigest.toLowerCase());
    return { ok, reason: ok ? "verified" : "digest_mismatch" };
  }

  // If we require verification but can't verify, reject.
  if (requireVerify) {
    return { ok: false, reason: "no_verification_fields" };
  }

  // If not required, accept but mark as unverified.
  return { ok: true, reason: "accepted_unverified" };
}

function deriveExternalId(params: URLSearchParams) {
  // Prefer transactionId; fallback to subscriptionId + timestamp + eventType
  const transactionId = params.get("transactionId");
  if (transactionId) return transactionId;

  const subscriptionId = params.get("subscriptionId") || "no-sub";
  const timestamp = params.get("timestamp") || params.get("time") || "";
  const eventType = params.get("eventType") || params.get("event") || "unknown";

  // stable-ish id for retries
  return `${subscriptionId}:${timestamp}:${eventType}`.slice(0, 190);
}

function normalizeStatus(eventTypeRaw: string) {
  const e = (eventTypeRaw || "").toLowerCase();

  // Add/adjust mappings as you confirm the exact event names you enabled in CCBill.
  if (e.includes("newsalesuccess") || e.includes("sale") || e.includes("rebill") || e.includes("success")) return "ACTIVE";
  if (e.includes("cancel")) return "CANCELED";
  if (e.includes("chargeback")) return "CHARGEBACK";
  if (e.includes("refund")) return "REFUNDED";
  if (e.includes("expire")) return "EXPIRED";
  if (e.includes("fail") || e.includes("decline") || e.includes("deny")) return "PAST_DUE";

  return "UNKNOWN";
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);

  const eventType = params.get("eventType") || params.get("event") || "unknown";
  const subscriptionId = params.get("subscriptionId") || null;
  const transactionId = params.get("transactionId") || null;

  // Idempotency key
  const externalId = deriveExternalId(params);

  // Write webhook event (dedupe via unique constraint)
  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_externalId: {
        provider: "CCBILL",
        externalId,
      },
    },
  });

  // If we've already processed this exact event, ack fast
  if (existing?.status === "PROCESSED") {
    return NextResponse.json({ ok: true, deduped: true });
  }

  // Create or update event record
  await prisma.webhookEvent.upsert({
    where: {
      provider_externalId: {
        provider: "CCBILL",
        externalId,
      },
    },
    update: {
      rawBody,
      eventType,
      subscriptionId,
      transactionId,
      status: "RECEIVED",
      error: null,
    },
    create: {
      provider: "CCBILL",
      externalId,
      rawBody,
      eventType,
      subscriptionId,
      transactionId,
      status: "RECEIVED",
      payloadJson: Object.fromEntries(params.entries()),
    },
  });

  // Verify
  const v = verifyCcbill(params);
  if (!v.ok) {
    await prisma.webhookEvent.update({
      where: {
        provider_externalId: {
          provider: "CCBILL",
          externalId,
        },
      },
      data: { status: "REJECTED", error: v.reason },
    });
    return NextResponse.json({ error: "Rejected", reason: v.reason }, { status: 401 });
  }

  await prisma.webhookEvent.update({
    where: {
      provider_externalId: {
        provider: "CCBILL",
        externalId,
      },
    },
    data: { status: "VERIFIED" },
  });

  // Apply state changes
  const status = normalizeStatus(eventType);

  // IMPORTANT:
  // We do NOT create users here (your old route created TEMP_HASHED users — that's a compliance risk).
  // We only update subscription records.
  //
  // Your existing schema uses BOTH "billingSubscription" and "subscription".
  // We'll update both if present, but you should converge later.
  try {
    // Update BillingSubscription if it uses subscriptionId as unique key
    if (subscriptionId) {
      // Best effort: this assumes billingSubscription has unique subscriptionId
      await prisma.billingSubscription.upsert({
        where: { subscriptionId },
        update: { status },
        create: {
          subscriptionId,
          eventType,
          status,
          subscriberUsername: params.get("subscriberUsername") || "",
          creatorUsername: params.get("creatorUsername") || "",
          siteSection: params.get("siteSection") || "",
        },
      });
    }

    // Optional: update your other subscription table if it keys by ccbillSubscriptionId
    if (subscriptionId) {
      // If your model has ccbillSubscriptionId unique, this works.
      // If not, it will throw and we’ll rely on BillingSubscription for gating.
      // (We’ll adjust if needed after one compile.)
      // @ts-ignore
      if (prisma.subscription) {
        // @ts-ignore
        await prisma.subscription.upsert({
          where: { ccbillSubscriptionId: subscriptionId },
          update: { status },
          create: {
            // these fields must exist in your schema; if they don’t, delete this block.
            subscriberEmail: params.get("email") || "",
            creatorEmail: params.get("creatorEmail") || "UNKNOWN",
            ccbillSubscriptionId: subscriptionId,
            siteSection: params.get("siteSection") || "SFW",
            status,
          },
        });
      }
    }

    await prisma.billingAuditLog.create({
      data: {
        provider: "CCBILL",
        action: `WEBHOOK_${eventType}`,
        subscriptionId: subscriptionId || undefined,
        userEmail: params.get("email") || undefined,
        metadata: {
          status,
          verified: v.reason,
          transactionId,
        },
      },
    });

    await prisma.webhookEvent.update({
      where: {
        provider_externalId: {
          provider: "CCBILL",
          externalId,
        },
      },
      data: { status: "PROCESSED", processedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await prisma.webhookEvent.update({
      where: {
        provider_externalId: {
          provider: "CCBILL",
          externalId,
        },
      },
      data: { status: "FAILED", error: String(err) },
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
