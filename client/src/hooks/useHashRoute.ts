import { useEffect, useState } from 'react';

export type AppRoute = 'dashboard' | 'journal' | 'schedule' | 'settings';

function readRoute(): AppRoute {
  const route = window.location.hash.replace('#/', '');

  if (route === 'journal' || route === 'schedule' || route === 'settings') {
    return route;
  }

  return 'dashboard';
}

export function useHashRoute() {
  const [activePage, setActivePageState] = useState<AppRoute>(readRoute);

  useEffect(() => {
    const handleHashChange = () => setActivePageState(readRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function setActivePage(route: AppRoute) {
    window.location.hash = `/${route}`;
    setActivePageState(route);
  }

  return [activePage, setActivePage] as const;
}
