import PageHeader from '../components/PageHeader';
import { events } from '../data/events';

export default function EventsPage() {
  return <><PageHeader eyebrow="Klubbkalender" title="Arrangement" description="Treninger, klubbløp og sosiale samlinger i Meldal RC Klubb." /><section className="mx-auto grid max-w-7xl gap-5 px-6 py-20 lg:grid-cols-3 lg:px-8">{events.map(event => <article className="rounded-2xl border border-white/10 bg-[#111923] p-6" key={event.title}><p className="font-black text-orange-500">{event.date}. {event.month}</p><h2 className="mt-6 text-xl font-bold">{event.title}</h2><p className="mt-2 text-slate-400">{event.time} · Meldal RC-bane</p></article>)}</section></>;
}
