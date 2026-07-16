import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { saveTokens } from '../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login?useCookies=false', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Feil e-post eller passord.');
      const result = await response.json();
      saveTokens(result.accessToken, result.refreshToken);
      navigate((location.state as { from?: string } | null)?.from ?? '/admin/bilder');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Innloggingen mislyktes.');
    } finally {
      setLoading(false);
    }
  }

  return <>
    <PageHeader eyebrow="Medlemsside" title="Logg inn" description="Logg inn for å få tilgang til medlemssidene." />
    <section className="mx-auto max-w-lg px-6 py-16">
      <form className="space-y-5 rounded-2xl border border-white/10 bg-[#111923] p-8" onSubmit={login}>
        <label className="block text-sm font-semibold">E-post<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3 outline-none focus:border-orange-500" onChange={event => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label className="block text-sm font-semibold">Passord<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3 outline-none focus:border-orange-500" onChange={event => setPassword(event.target.value)} required type="password" value={password} /></label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="w-full rounded-lg bg-orange-500 px-5 py-3 font-bold text-black disabled:opacity-50" disabled={loading} type="submit">{loading ? 'Logger inn…' : 'Logg inn'}</button>
      </form>
    </section>
  </>;
}
