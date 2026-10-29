import {StrictMode, Suspense, lazy, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Service worker + install/update prompts load after the page has finished loading,
// so they stay off the critical rendering path.
const PwaManager = lazy(() => import('./components/PwaManager.tsx'));

function DeferredPwa() {
  const [ready, setReady] = useState(document.readyState === 'complete');
  useEffect(() => {
    if (ready) return;
    const onLoad = () => setReady(true);
    window.addEventListener('load', onLoad, {once: true});
    return () => window.removeEventListener('load', onLoad);
  }, [ready]);
  return ready ? (
    <Suspense fallback={null}>
      <PwaManager />
    </Suspense>
  ) : null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <DeferredPwa />
  </StrictMode>,
);
