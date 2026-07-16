import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ContentPage from './pages/ContentPage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import AdminImagesPage from './pages/AdminImagesPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="om-klubben" element={<ContentPage eyebrow="Om oss" title="Om klubben" description="Meldal RC Klubb samler RC-interesserte i alle aldre. Hos oss handler det om kjøring, læring, mekking og et godt sosialt miljø." />} />
        <Route path="arrangement" element={<EventsPage />} />
        <Route path="banen" element={<ContentPage eyebrow="Meldal RC-bane" title="Banen" description="Her finner du informasjon om banen, åpningstider, regler og hvordan du finner fram." />} />
        <Route path="kontakt" element={<ContentPage eyebrow="Ta kontakt" title="Kontakt oss" description="Har du spørsmål om klubben, medlemskap eller aktiviteter? Vi hjelper deg gjerne." />} />
        <Route path="bli-medlem" element={<ContentPage eyebrow="Bli en del av miljøet" title="Bli medlem" description="Som medlem får du tilgang til klubbens aktiviteter, bane og et inkluderende RC-miljø." />} />
        <Route path="medlem/login" element={<LoginPage />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="admin/bilder" element={<AdminImagesPage />} />
        </Route>
        <Route path="*" element={<ContentPage eyebrow="404" title="Siden finnes ikke" description="Siden du leter etter er flyttet eller finnes ikke." />} />
      </Route>
    </Routes>
  );
}

export default App;
