import { Link } from 'react-router-dom';
import heroImage from '../assets/meldal-rc-hero.png';
import ManagedImage from '../components/ManagedImage';
import { events } from '../data/events';

export default function HomePage() {
  return <>
    <section className="relative flex min-h-[720px] items-center overflow-hidden">
      <ManagedImage placement="home.hero" className="absolute inset-0 h-full w-full object-cover" fallbackSrc={heroImage} fallbackAlt="Radiostyrte biler på offroadbanen" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090d12] via-[#090d12]/85 to-transparent" />
      <div className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-8"><div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[.28em] text-orange-400">Fart, spenning og fellesskap</p>
        <h1 className="mt-5 text-5xl font-black uppercase leading-[.95] sm:text-7xl">Velkommen til <span className="block text-orange-500">Meldal RC Klubb</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">Et inkluderende miljø for alle som liker radiostyrte biler.</p>
        <div className="mt-9 flex gap-4"><Link className="rounded-lg bg-orange-500 px-6 py-4 font-bold text-black" to="/bli-medlem">Bli medlem</Link><Link className="rounded-lg border border-white/20 px-6 py-4 font-bold" to="/arrangement">Se aktiviteter</Link></div>
      </div></div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-[.25em] text-orange-500">På kalenderen</p><h2 className="mt-3 text-4xl font-black uppercase">Neste aktiviteter</h2></div><Link className="text-orange-400" to="/arrangement">Se alle →</Link></div>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">{events.map(event => <article className="rounded-2xl border border-white/10 bg-[#111923] p-6" key={event.title}><p className="font-black text-orange-500">{event.date}. {event.month}</p><h3 className="mt-5 text-xl font-bold">{event.title}</h3><p className="mt-2 text-slate-400">{event.time} · {event.type}</p></article>)}</div>
    </section>
  </>;
}
