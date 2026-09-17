export default function ActivityPage() {
  const events = [
    { time: "09:42", title: "Cost data refreshed", desc: "30 days of cost data processed.", date: "Today" },
    { time: "09:38", title: "Optimization identified", desc: "EC2 i-0demo001 • Potential savings $118.70/mo", date: "Today" },
    { time: "Yesterday", title: "Recommendation reviewed", desc: "EBS vol-0demo002", date: "Yesterday" },
    { time: "Sep 15", title: "FX rate recorded", desc: "₦1,550/USD • demo-fixture", date: "Sep 15" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-zinc-500">Everything that happened in this workspace.</p>
      </div>
      <div className="space-y-6">
        {["Today", "Yesterday", "Sep 15"].map((date) => (
          <div key={date}>
            <div className="font-mono text-xs tracking-widest text-zinc-500">{date.toUpperCase()}</div>
            <div className="mt-2 space-y-3">
              {events
                .filter((e) => e.date === date)
                .map((e, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="font-mono text-xs text-zinc-500">{e.time}</div>
                    <div>
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-zinc-500">{e.desc}</div>
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
