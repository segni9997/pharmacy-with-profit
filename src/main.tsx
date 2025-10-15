import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeToggle } from './components/theme-toggle.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/auth.tsx';
import { Toaster } from 'sonner';
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
          <ThemeToggle />
        </AuthProvider>
      </Provider>
    </Suspense>
    <Analytics />
    <Toaster position="bottom-center" richColors />
  </StrictMode>
);
