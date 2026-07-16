import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#090d12] text-white">
      <Navbar />
      <main className="min-h-screen pt-16"><Outlet /></main>
      <Footer />
    </div>
  );
}
