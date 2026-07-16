export default function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="border-b border-white/10 bg-[#0d131b]"><div className="mx-auto max-w-7xl px-6 py-20 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.25em] text-orange-500">{eyebrow}</p><h1 className="mt-4 text-4xl font-black uppercase sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">{description}</p></div></header>;
}
