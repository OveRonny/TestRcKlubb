import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authHeaders } from '../services/auth';

export default function ProtectedAdminRoute() {
  const [state, setState] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    fetch('/api/auth/me', { headers: authHeaders() })
      .then(async response => {
        if (!response.ok) throw new Error();
        const user = await response.json();
        setState(user.roles.includes('Admin') ? 'allowed' : 'denied');
      })
      .catch(() => setState('denied'));
  }, []);

  if (state === 'loading') return <div className="grid min-h-[60vh] place-items-center text-slate-400">Kontrollerer tilgang…</div>;
  return state === 'allowed' ? <Outlet /> : <Navigate replace to="/medlem/login" />;
}
