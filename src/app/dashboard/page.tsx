import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { safeAuth, safeCurrentUser } from "@/lib/auth";
import { ensureUser, getUserAudits } from "@/lib/db/user";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-gray-100 text-gray-700" },
  starter: { label: "Starter", color: "bg-blue-100 text-blue-700" },
  pro: { label: "Pro", color: "bg-purple-100 text-purple-700" },
  agency: { label: "Agency", color: "bg-orange-100 text-orange-700" },
};

export default async function DashboardPage() {
  const { userId } = await safeAuth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await safeCurrentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;

  const user = await ensureUser(userId, email, name);
  const audits = user ? await getUserAudits(user.id) : [];
  const plan = user?.plan || "free";
  const planMeta = PLAN_LABELS[plan];

  return (
    <div className="min-h-screen bg-bg-near-white">
      {/* Top Nav — dark, matches main site */}
      <nav className="site-header">
        <div className="max-w-[1200px] mx-auto px-[22px] h-12 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-[14px] text-text-on-dark/90 hover:text-text-on-dark transition-opacity"
          >
            <svg width="26" height="26" viewBox="0 0 44 44" aria-hidden="true">
              <line x1="22" y1="7" x2="37" y2="22" stroke="#f97316" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
              <line x1="37" y1="22" x2="22" y2="37" stroke="#3b82f6" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
              <line x1="22" y1="37" x2="7" y2="22" stroke="#10b981" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
              <line x1="7" y1="22" x2="22" y2="7" stroke="#a855f7" strokeWidth="1.6" strokeOpacity="0.38" strokeLinecap="round" />
              <circle cx="22" cy="7" r="6.5" fill="#f97316" />
              <circle cx="37" cy="22" r="6.5" fill="#3b82f6" />
              <circle cx="22" cy="37" r="6.5" fill="#10b981" />
              <circle cx="7" cy="22" r="6.5" fill="#a855f7" />
            </svg>
            AcquihireTech
          </a>
          <div className="flex items-center gap-4">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${planMeta.color}`}>
              {planMeta.label} plan
            </span>
            <a
              href="/pricing"
              className="text-[12px] px-4 py-[5px] bg-white/12 text-text-on-dark rounded-[980px] font-medium hover:bg-white/22 transition-colors"
            >
              Upgrade
            </a>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold text-text mb-2">
            Welcome back{name ? `, ${name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-text-secondary">
            {audits.length === 0
              ? "Run your first audit to get started."
              : `${audits.length} audit${audits.length === 1 ? "" : "s"} in your history`}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-[18px] bg-white border border-border-light">
            <div className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-1">
              Audits run
            </div>
            <div className="font-display text-2xl font-semibold text-text">{audits.length}</div>
          </div>
          <div className="p-5 rounded-[18px] bg-white border border-border-light">
            <div className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-1">
              Plan
            </div>
            <div className="font-display text-2xl font-semibold text-text capitalize">{plan}</div>
          </div>
          <div className="p-5 rounded-[18px] bg-white border border-border-light">
            <div className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-1">
              Crawls remaining
            </div>
            <div className="font-display text-2xl font-semibold text-text">
              {plan === "free" ? user?.crawls_remaining ?? 0 : "∞"}
            </div>
          </div>
        </div>

        {/* New audit CTA */}
        <div className="mb-10 p-6 rounded-[18px] bg-gradient-to-br from-bg-tint to-white border border-border-light">
          <h3 className="font-display text-lg font-semibold text-text mb-3">
            Run a new audit
          </h3>
          <form action="/api/audit/quick" method="POST" className="flex gap-2 flex-col sm:flex-row">
            <input
              type="url"
              name="url"
              placeholder="https://example.com"
              required
              className="flex-1 px-4 py-2.5 rounded-[12px] border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-engine-conversion"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-bg-dark text-white rounded-[12px] font-medium text-sm hover:bg-black transition-colors"
            >
              Audit
            </button>
          </form>
        </div>

        {/* Audit history */}
        {audits.length > 0 && (
          <>
            <h2 className="font-display text-xl font-semibold text-text mb-4">
              Recent audits
            </h2>
            <div className="space-y-2">
              {audits.map((audit: any) => (
                <a
                  key={audit.id}
                  href={`/report/${audit.id}`}
                  className="flex items-center justify-between p-4 rounded-[12px] bg-white border border-border-light hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-medium text-text text-sm">
                      {audit.url || audit.metadata?.domain || "Unknown"}
                    </p>
                    <p className="text-xs text-text-dim">
                      {new Date(audit.created_at).toLocaleDateString()} ·{" "}
                      {audit.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-semibold text-text">
                      {audit.overall_score ? Math.round(audit.overall_score) : "—"}
                    </div>
                    <div className="text-xs text-text-dim">/ 100</div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
