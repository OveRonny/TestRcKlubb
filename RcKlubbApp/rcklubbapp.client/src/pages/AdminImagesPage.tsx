import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { authHeaders } from '../services/auth';

interface MediaItem {
  id: string;
  fileName: string;
  title: string;
  altText: string;
  url: string;
  size: number;
  uploadedAt: string;
  placements: string[];
}

const placementOptions = [{ key: 'home.hero', label: 'Forside – stort hero-bilde' }];

export default function AdminImagesPage() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File>();
  const [editing, setEditing] = useState<MediaItem>();
  const [message, setMessage] = useState('');

  const load = () => fetch('/api/admin/media', { headers: authHeaders() })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(setImages)
    .catch(() => setMessage('Kunne ikke hente mediebiblioteket.'));

  useEffect(() => { load(); }, []);

  async function upload(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/admin/media', { method: 'POST', headers: authHeaders(), body: formData });
    const result = await response.json();
    setMessage(response.ok ? 'Bildet er lastet opp.' : result.message);
    if (response.ok) { setFile(undefined); await load(); }
  }

  async function saveMetadata(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const response = await fetch(`/api/admin/media/${editing.id}`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editing.title, altText: editing.altText }),
    });
    setMessage(response.ok ? 'Bildeteksten er lagret.' : 'Kunne ikke lagre.');
    if (response.ok) { setEditing(undefined); await load(); }
  }

  async function replace(image: MediaItem, replacement?: File) {
    if (!replacement) return;
    const formData = new FormData();
    formData.append('image', replacement);
    const response = await fetch(`/api/admin/media/${image.id}/file`, { method: 'PUT', headers: authHeaders(), body: formData });
    setMessage(response.ok ? 'Bildefilen er erstattet overalt.' : 'Kunne ikke erstatte bildet.');
    if (response.ok) await load();
  }

  async function assign(placement: string, imageId: string) {
    const response = await fetch(`/api/admin/media/placements/${encodeURIComponent(placement)}`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    });
    setMessage(response.ok ? 'Bildet brukes nå på valgt plassering.' : 'Kunne ikke velge bildet.');
    if (response.ok) await load();
  }

  async function remove(image: MediaItem) {
    if (!confirm(`Slette «${image.title || image.fileName}»?`)) return;
    const response = await fetch(`/api/admin/media/${image.id}`, { method: 'DELETE', headers: authHeaders() });
    setMessage(response.ok ? 'Bildet er slettet.' : 'Bildet kunne ikke slettes.');
    if (response.ok) await load();
  }

  return <>
    <PageHeader eyebrow="Administrasjon" title="Mediebibliotek" description="Last opp, rediger, erstatt og bruk bilder i hele appen." />
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
      <form className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111923] p-6 sm:flex-row sm:items-end" onSubmit={upload}>
        <label className="flex-1 text-sm font-semibold">Nytt bilde<input className="mt-2 block w-full rounded-lg border border-slate-700 bg-[#090d12] p-3" accept="image/jpeg,image/png,image/webp" onChange={event => setFile(event.target.files?.[0])} type="file" /></label>
        <button className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-black disabled:opacity-40" disabled={!file}>Last opp</button>
      </form>
      {message && <p className="my-5 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm">{message}</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {images.map(image => <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111923]" key={image.id}>
          <img className="aspect-video w-full object-cover" src={image.url} alt={image.altText || image.title} />
          <div className="space-y-4 p-5">
            <div><h2 className="font-bold">{image.title || 'Uten navn'}</h2><p className="mt-1 text-xs text-slate-500">{(image.size / 1048576).toFixed(1)} MB</p></div>
            {image.placements.length > 0 && <p className="text-xs font-semibold text-orange-400">Brukes: {image.placements.join(', ')}</p>}
            <label className="block text-xs font-semibold text-slate-400">Bruk bildet som
              <select className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-3 py-2 text-sm text-white" defaultValue="" onChange={event => event.target.value && assign(event.target.value, image.id)}>
                <option value="">Velg plassering…</option>{placementOptions.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button className="rounded-md border border-slate-700 px-3 py-2 text-sm" onClick={() => setEditing(image)} type="button">Rediger</button>
              <label className="cursor-pointer rounded-md border border-slate-700 px-3 py-2 text-center text-sm">Erstatt<input className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={event => replace(image, event.target.files?.[0])} type="file" /></label>
              <button className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-400" onClick={() => remove(image)} type="button">Slett</button>
            </div>
          </div>
        </article>)}
      </div>
    </section>
    {editing && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-5"><form className="w-full max-w-lg space-y-5 rounded-2xl border border-white/10 bg-[#111923] p-7" onSubmit={saveMetadata}>
      <h2 className="text-2xl font-bold">Rediger bilde</h2>
      <label className="block text-sm font-semibold">Navn<input className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" value={editing.title} onChange={event => setEditing({ ...editing, title: event.target.value })} /></label>
      <label className="block text-sm font-semibold">Alternativ tekst<textarea className="mt-2 w-full rounded-lg border border-slate-700 bg-[#090d12] px-4 py-3" rows={3} value={editing.altText} onChange={event => setEditing({ ...editing, altText: event.target.value })} /></label>
      <div className="flex justify-end gap-3"><button className="px-4 py-2" onClick={() => setEditing(undefined)} type="button">Avbryt</button><button className="rounded-lg bg-orange-500 px-5 py-2 font-bold text-black">Lagre</button></div>
    </form></div>}
  </>;
}
