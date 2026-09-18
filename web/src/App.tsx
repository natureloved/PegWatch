import { useState, useEffect } from 'react';
import { ExactHomepage } from './components/ExactHomepage';
import { ExactDashboard } from './components/ExactDashboard';

export function App() {
  const [page, setPage] = useState<'home' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash.includes('dashboard') || hash.includes('demo') || params.get('view') === 'dashboard') {
        return 'dashboard';
      }
    }
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('dashboard') || hash.includes('demo')) {
        setPage('dashboard');
      } else if (hash.includes('home') || hash.includes('top') || hash === '') {
        setPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleGoToDashboard = () => {
    setPage('dashboard');
    window.location.hash = 'dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToHome = () => {
    setPage('home');
    window.location.hash = 'home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A1218] text-[#F4F7F6]">
      {page === 'dashboard' ? (
        <ExactDashboard onGoToHome={handleGoToHome} />
      ) : (
        <ExactHomepage onGoToDashboard={handleGoToDashboard} />
      )}
    </div>
  );
}

export default App;
