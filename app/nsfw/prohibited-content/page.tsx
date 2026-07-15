import Link from "next/link";
import { requireAdminPage } from "@/src/lib/adminGuard";

export const dynamic = "force-dynamic";

export default async function ProhibitedContentPolicyPage() {
  await requireAdminPage("/nsfw/prohibited-content");

  return (
    <main className="min-h-screen bg-[#080309] px-6 py-16 text-white">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/nsfw"
          className="text-sm font-bold text-zinc-400 hover:text-white"
        >
          ← Back to private NSFW review
        </Link>

        <p className="mt-10 text-sm font-black uppercase tracking-[0.35em] text-red-300">
          OnlyAi safety policy
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Prohibited Content Policy
        </h1>

        <p className="mt-5 text-sm leading-7 text-zinc-400">
          These restrictions apply to uploads, prompts, generated media,
          profile material, captions, messages, and any other content submitted
          to OnlyAi&apos;s adult lane.
        </p>

        <div className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-zinc-300">
          <section>
            <h2 className="text-xl font-black text-white">
              Minors and age-ambiguous subjects
            </h2>
            <p className="mt-2">
              Content involving anyone under 18 is strictly prohibited. This
              includes real, fictional, animated, AI-generated, aged-up,
              school-age, described-as-underage, or reasonably age-ambiguous
              subjects. Every depicted subject must be clearly presented as an
              adult aged 18 or older.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Identifiable real people
            </h2>
            <p className="mt-2">
              Content may not depict, imitate, recreate, face-swap, clone, or
              intentionally resemble an identifiable real person without
              documented authorization. This includes celebrities, public
              figures, influencers, private individuals, former partners, and
              any person whose likeness could reasonably be recognized.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Non-consensual content
            </h2>
            <p className="mt-2">
              Revenge content, hidden-camera material, coercion, exploitation,
              trafficking, incapacitated subjects, stolen private media, and
              any sexual content created or distributed without consent are
              prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Ownership and authorization
            </h2>
            <p className="mt-2">
              Uploaders must own or be licensed to use every submitted asset
              and must maintain any required model releases, consent records,
              identity records, and authorization documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Illegal or abusive material
            </h2>
            <p className="mt-2">
              Content involving bestiality, incest, sexual violence, severe
              bodily harm, exploitation, trafficking, or any other illegal or
              abusive activity is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              Enforcement
            </h2>
            <p className="mt-2">
              OnlyAi may reject uploads, remove content, preserve relevant
              records, suspend accounts, report apparent illegal material, and
              cooperate with payment processors or lawful authorities.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
