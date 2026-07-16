import PageHeader from '../components/PageHeader';

export default function ContentPage(props: { eyebrow: string; title: string; description: string }) {
  return <><PageHeader {...props} /><section className="mx-auto max-w-7xl px-6 py-20 lg:px-8"><div className="max-w-3xl rounded-2xl border border-white/10 bg-[#111923] p-8 text-lg leading-8 text-slate-400">Mer innhold og informasjon kommer her.</div></section></>;
}
