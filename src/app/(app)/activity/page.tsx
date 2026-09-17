import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const sp = await searchParams;
  const scenarioId = (sp.scenario as string) || "balanced-startup";
  const dataset = getDemoDataset(scenarioId);

  // Try to load real ActivityEvents; fall back to deterministic demo timeline
  let dbEvents: { time: string; title: string; desc: string; date: string }[] | null = null;
  try {
    const session = await auth();
    const userId = (session?.user as unknown as { id?: string })?.id;
    const membership = userId ? await prisma.membership.findFirst({ where: { userId } }) : null;
    if (membership) {
      const rows = await prisma.activityEvent.findMany({ where: { organizationId: membership.organizationId }, orderBy: { createdAt: "desc" }, take: 10 });
      if (rows.length) dbEvents = rows.map((r) => ({ time: new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), title: r.title, desc: r.description ?? "", date: new Date(r.createdAt).toLocaleDateString() }));
    }
  } catch { /* fallback to demo */ }

  // Demo timeline — deterministic per scenario, explains data lineage
  let demoRecTitle = "Optimization identified";
  let demoRecDesc = `EC2 i-0demo001 · $118.70/mo`;
  try {
    const op = new DemoOptimizationProvider(scenarioId);
    const recs = await op.getRecommendations({ organizationId: "demo" });
    if (recs[0]) { demoRecDesc = `${recs[0].resourceId} · $${recs[0].estimatedMonthlySavingsUsd.toFixed(2)}/mo · ${recs[0].source}`; }
  } catch { /* ignore */ }

  const events = dbEvents ?? [
    { time: "09:42", title: "Cost data refreshed", desc: `30 days · ${dataset.scenario.name} · $${dataset.cost.serviceBreakdown.reduce((s,x)=>s+x.amountUsd,0).toFixed(2)} processed`, date: "Today" },
    { time: "09:38", title: demoRecTitle, desc: demoRecDesc, date: "Today" },
    { time: "Yesterday", title: "Demo scenario reviewed", desc: `${dataset.scenario.name} · ${scenarioId}`, date: "Yesterday" },
    { time: new Date(dataset.fx.observedAt).toLocaleDateString(), title: "FX rate recorded", desc: `₦${dataset.fx.usdNgn.toLocaleString()}/USD · ${dataset.fx.provider} · not a bank charge`, date: new Date(dataset.fx.observedAt).toLocaleDateString() },
  ];

  const groups = Array.from(new Set(events.map((e) => e.date)));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-stone-500">Audit history for this workspace — cost refreshes, recommendations, scenario and FX events.</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">Demo workspace — events are deterministic per scenario. Real AWS events will appear here after you connect an account.</div>
      <div className="space-y-6">
        {groups.map((date) => (
          <div key={date}>
            <div className="font-mono text-xs tracking-widest text-stone-500">{date.toUpperCase()}</div>
            <div className="mt-2 space-y-3">
              {events.filter((e) => e.date === date).map((e, i) => (
                <div key={i} className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="font-mono text-xs text-stone-500 shrink-0">{e.time}</div>
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-xs leading-5 text-stone-500">{e.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
