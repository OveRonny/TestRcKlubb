import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { authHeaders } from '../services/auth';

interface Application {
  id: string; fullName: string; email: string; phone: string; birthYear?: number; birthDate?: string;
  streetAddress?: string; postalCode?: string; city?: string;
  experience: string; message: string; status: string; submittedAt: string;
  adminComment?: string; paymentYear?: number; paidAt?: string;
}

const currentYear = new Date().getFullYear();
const isAdult = (application: Application) => {
  if (application.birthDate) {
    const birthDate = new Date(`${application.birthDate}T00:00:00`);
    const eighteenthBirthday = new Date(
      birthDate.getFullYear() + 18,
      birthDate.getMonth(),
      birthDate.getDate(),
    );
    return eighteenthBirthday <= new Date();
  }
  return application.birthYear !== undefined && currentYear - application.birthYear >= 18;
};
const hasBirthInformation = (application: Application) =>
  Boolean(application.birthDate) || application.birthYear !== undefined;
const paidThisYear = (application: Application) => application.paymentYear === currentYear;

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState('Pending');
  const [message, setMessage] = useState('');

  const load = () => fetch('/api/admin/membership-applications', { headers: authHeaders() })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(setApplications)
    .catch(() => setMessage('Kunne ikke hente søknadene.'));

  useEffect(() => { load(); }, []);

  async function review(id: string, status: 'Approved' | 'Rejected') {
    const adminComment = prompt(status === 'Approved' ? 'Kommentar til godkjenningen (valgfritt)' : 'Begrunnelse for avslag (valgfritt)') ?? '';
    const response = await fetch(`/api/admin/membership-applications/${id}`, {
      method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminComment }),
    });
    setMessage(response.ok ? 'Søknaden er behandlet.' : 'Kunne ikke behandle søknaden.');
    if (response.ok) await load();
  }

  async function setPayment(id: string, paid: boolean) {
    const response = await fetch(`/api/admin/membership-applications/${id}/payment`, {
      method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid }),
    });
    setMessage(response.ok ? (paid ? `Betaling for ${currentYear} er registrert.` : 'Betalingen er nullstilt.') : 'Kunne ikke oppdatere betaling.');
    if (response.ok) await load();
  }

  const visible = applications.filter(application => {
    if (filter === 'All') return true;
    if (filter === 'PaymentDue') return application.status === 'Approved' && isAdult(application) && !paidThisYear(application);
    if (filter === 'Paid') return application.status === 'Approved' && isAdult(application) && paidThisYear(application);
    if (filter === 'Free') return application.status === 'Approved' && hasBirthInformation(application) && !isAdult(application);
    return application.status === filter;
  });
  const adultMembers = applications.filter(item => item.status === 'Approved' && isAdult(item));
  const paidCount = adultMembers.filter(paidThisYear).length;

  return <>
    <PageHeader eyebrow="Administrasjon" title="Medlemmer og søknader" description={`Behandle søknader og følg medlemsbetaling for ${currentYear}.`} />
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Betalingspliktige" value={adultMembers.length} />
        <Stat label={`Betalt ${currentYear}`} value={paidCount} color="text-green-400" />
        <Stat label="Ikke betalt" value={adultMembers.length - paidCount} color="text-orange-400" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[['Pending','Venter'],['PaymentDue','Ikke betalt'],['Paid','Betalt'],['Free','Under 18'],['Approved','Alle medlemmer'],['Rejected','Avslått'],['All','Alle']].map(([value,label]) =>
          <button className={`rounded-full px-4 py-2 text-sm ${filter === value ? 'bg-orange-500 font-bold text-black' : 'bg-white/5 text-slate-300'}`} key={value} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
      {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        {visible.map(application => {
          const adult = isAdult(application);
          const paid = paidThisYear(application);
          return <article className="rounded-2xl border border-white/10 bg-[#111923] p-6" key={application.id}>
            <div className="flex justify-between gap-4"><div><h2 className="text-xl font-bold">{application.fullName}</h2><p className="mt-1 text-sm text-slate-400">{application.email} · {application.phone}</p></div><span className="h-fit rounded-full border border-white/10 px-3 py-1 text-xs">{application.status}</span></div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Erfaring</dt><dd>{application.experience}</dd></div><div><dt className="text-slate-500">Fødselsdato</dt><dd>{application.birthDate ? new Date(`${application.birthDate}T00:00:00`).toLocaleDateString('nb-NO') : application.birthYear ?? 'Ikke oppgitt'}</dd></div></dl>
            <div className="mt-4 text-sm"><p className="text-slate-500">Adresse</p><p>{application.streetAddress ? `${application.streetAddress}, ${application.postalCode} ${application.city}` : 'Ikke registrert'}</p></div>
            {application.message && <p className="mt-5 rounded-lg bg-black/20 p-4 text-sm leading-6 text-slate-300">{application.message}</p>}
            {application.status === 'Approved' && <div className={`mt-5 rounded-lg border p-4 ${!adult ? 'border-blue-500/30 bg-blue-500/10' : paid ? 'border-green-500/30 bg-green-500/10' : 'border-orange-500/30 bg-orange-500/10'}`}>
              <p className="font-bold">{!hasBirthInformation(application) ? 'Alder ikke registrert' : !adult ? 'Betalingsfri – under 18 år' : paid ? `Betalt for ${currentYear}` : `Mangler betaling for ${currentYear}`}</p>
              {adult && <button className="mt-3 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20" onClick={() => setPayment(application.id, !paid)}>{paid ? 'Nullstill betaling' : 'Registrer som betalt'}</button>}
            </div>}
            <p className="mt-4 text-xs text-slate-500">Søkt {new Date(application.submittedAt).toLocaleString('nb-NO')}</p>
            {application.status === 'Pending' && <div className="mt-5 flex gap-3"><button className="rounded-lg bg-green-500 px-4 py-2 font-bold text-black" onClick={() => review(application.id, 'Approved')}>Godkjenn</button><button className="rounded-lg border border-red-800 px-4 py-2 text-red-400" onClick={() => review(application.id, 'Rejected')}>Avslå</button></div>}
            {application.adminComment && <p className="mt-4 text-sm text-slate-400">Admin: {application.adminComment}</p>}
          </article>;
        })}
      </div>
      {visible.length === 0 && <div className="mt-7 rounded-2xl border border-white/10 p-12 text-center text-slate-500">Ingen medlemmer eller søknader i denne kategorien.</div>}
    </section>
  </>;
}

function Stat({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return <div className="rounded-xl border border-white/10 bg-[#111923] p-5"><p className={`text-3xl font-black ${color}`}>{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>;
}
