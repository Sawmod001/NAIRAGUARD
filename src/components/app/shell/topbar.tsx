export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-zinc-800 bg-[#0a0a0a] px-6 py-4">
      <h1 className="font-display text-xl font-semibold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
    </div>
  );
}
