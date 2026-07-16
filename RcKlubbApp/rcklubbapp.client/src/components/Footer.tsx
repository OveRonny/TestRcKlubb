import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className="border-t border-white/10 bg-[#070a0e]"><div className="mx-auto flex max-w-7xl justify-between px-6 py-10 text-sm text-slate-500"><p>© 2026 Meldal RC Klubb</p><Link className="hover:text-orange-400" to="/kontakt">Kontakt</Link></div></footer>;
}
