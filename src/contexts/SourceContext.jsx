import { createContext, useContext, useEffect, useState } from 'react';

const SourceContext = createContext({ source: null });

const STORAGE_KEY = 'barangpas_src';

export function SourceProvider({ children }) {
  const [source, setSource] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('src');
    if (src) {
      sessionStorage.setItem(STORAGE_KEY, src);
      setSource(src);
    } else {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setSource(stored);
    }
  }, []);

  return (
    <SourceContext.Provider value={{ source }}>
      {children}
    </SourceContext.Provider>
  );
}

export const useSource = () => useContext(SourceContext);
