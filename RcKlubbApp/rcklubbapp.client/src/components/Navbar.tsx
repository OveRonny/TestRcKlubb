import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  ['Hjem', '/'],
  ['Om klubben', '/om-klubben'],
  ['Arrangement', '/arrangement'],
  ['Banen', '/banen'],
  ['Kontakt', '/kontakt'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const linkStyle = ({ isActive }: { isActive: boolean }) => isActive ? 'text-orange-400' : 'text-slate-400 hover:text-orange-400';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-[#070b10]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <NavLink className="flex items-center gap-2.5" to="/" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-md bg-orange-500 text-xs font-black italic text-black">RC</span>
          <span><b className="block text-sm uppercase leading-none">Meldal</b><small className="text-[9px] uppercase tracking-[.22em] text-slate-500">RC Klubb</small></span>
        </NavLink>
        <nav className="hidden gap-6 text-sm font-medium lg:flex">
          {links.map(([label, to]) => <NavLink className={linkStyle} end={to === '/'} key={to} to={to}>{label}</NavLink>)}
        </nav>
        <div className="hidden gap-2 lg:flex">
          <NavLink className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-orange-400" to="/admin/medlemsoknader">Søknader</NavLink>
          <NavLink className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-orange-400" to="/admin/bilder">Bilder</NavLink>
          <NavLink className="px-3 py-2 text-sm font-semibold text-slate-400 hover:text-white" to="/bli-medlem">Bli medlem</NavLink>
          <NavLink className="rounded-md border border-orange-500/50 bg-orange-500/10 px-3.5 py-2 text-sm font-semibold text-orange-400" to="/medlem/login">Logg inn</NavLink>
        </div>
        <button className="h-9 w-9 rounded-md border border-slate-700 lg:hidden" onClick={() => setOpen(!open)} type="button" aria-label="Åpne meny">{open ? '×' : '☰'}</button>
      </div>
      {open && <nav className="border-t border-slate-800 bg-[#070b10] px-5 pb-5 lg:hidden">
        {links.map(([label, to]) => <NavLink className="block border-b border-slate-800 py-3.5 text-slate-300" key={to} onClick={() => setOpen(false)} to={to}>{label}</NavLink>)}
        <NavLink className="block border-b border-slate-800 py-3.5 text-slate-300" onClick={() => setOpen(false)} to="/bli-medlem">Bli medlem</NavLink>
        <NavLink className="mt-4 block rounded-md bg-orange-500 px-4 py-3 text-center font-bold text-black" to="/medlem/login">Logg inn</NavLink>
      </nav>}
    </header>
  );
}
