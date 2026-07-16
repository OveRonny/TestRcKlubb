import { useState } from 'react';
import PageHeader from '../components/PageHeader';

export default function MembershipPage() {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const body = {
      fullName: form.get('fullName'),
      email: form.get('email'),
      phone: form.get('phone'),
      streetAddress: form.get('streetAddress'),
      postalCode: form.get('postalCode'),
      city: form.get('city'),
      birthDate: form.get('birthDate') || null,
      experience: form.get('experience'),
      message: form.get('message'),
      privacyAccepted: form.get('privacyAccepted') === 'on',
    };
    try {
      const response = await fetch('/api/membership-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? 'Søknaden kunne ikke sendes.');
      setSent(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Søknaden kunne ikke sendes.');
    } finally {
      setSending(false);
    }
  }

  return <>
    <PageHeader eyebrow="Bli en del av miljøet" title="Søk medlemskap" description="Send en søknad til styret i Meldal RC Klubb. Admin behandler søknaden og tar kontakt med deg." />
    <section className="mx-auto max-w-3xl px-6 py-16">
      {sent ? <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center"><h2 className="text-2xl font-bold">Søknaden er sendt</h2><p className="mt-3 text-slate-300">Takk for interessen! Styret kontakter deg når søknaden er behandlet.</p></div> :
      <form className="grid gap-6 rounded-2xl border border-white/10 bg-[#111923] p-7 sm:grid-cols-2" onSubmit={submit}>
        <label className="sm:col-span-2">Fullt navn<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" name="fullName" required maxLength={120} /></label>
        <label>E-post<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" name="email" required type="email" maxLength={200} /></label>
        <label>Telefon<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" name="phone" required maxLength={30} /></label>
        <label className="sm:col-span-2">Gateadresse<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" name="streetAddress" required maxLength={150} autoComplete="street-address" /></label>
        <label>Postnummer<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" name="postalCode" required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="postal-code" /></label>
        <label>Poststed<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" name="city" required maxLength={100} autoComplete="address-level2" /></label>
        <label>Fødselsdato <span className="text-slate-500">(valgfritt)</span><input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3 [color-scheme:dark]" name="birthDate" min="1920-01-01" max={new Date().toISOString().slice(0, 10)} type="date" /></label>
        <label>Erfaring
          <select className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" name="experience" required>
            <option value="Nybegynner">Nybegynner</option><option value="Litt erfaring">Litt erfaring</option><option value="Erfaren">Erfaren</option>
          </select>
        </label>
        <label className="sm:col-span-2">Fortell litt om deg selv <span className="text-slate-500">(valgfritt)</span><textarea className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" name="message" rows={5} maxLength={1500} /></label>
        <label className="flex items-start gap-3 text-sm text-slate-300 sm:col-span-2"><input className="mt-1" name="privacyAccepted" required type="checkbox" />Jeg godtar at opplysningene lagres og brukes til behandling av medlemsøknaden.</label>
        {message && <p className="text-red-400 sm:col-span-2">{message}</p>}
        <button className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-black disabled:opacity-50 sm:col-span-2" disabled={sending}>{sending ? 'Sender søknad…' : 'Send medlemsøknad'}</button>
      </form>}
    </section>
  </>;
}
