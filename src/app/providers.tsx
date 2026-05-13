'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { persistor, store } from '@/store';
import { injectStore } from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  useEffect(() => {
    injectStore(store);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors theme="dark" position="top-center" />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
