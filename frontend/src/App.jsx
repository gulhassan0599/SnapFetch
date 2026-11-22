import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DownloadProvider } from './context/DownloadContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';

// Lazy-load page bundles
const Home = lazy(() => import('./pages/Home'));
const Download = lazy(() => import('./pages/Download'));
const RequestPlatform = lazy(() => import('./pages/RequestPlatform'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Page loading fallback spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader size="lg" message="Loading page components..." />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DownloadProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
              {/* Sticky Navigation Navbar */}
              <Navbar />

              {/* Main Page Layout Container */}
              <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/download" element={<Download />} />
                    <Route path="/request-platform" element={<RequestPlatform />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>

              {/* Layout Footer */}
              <Footer />
            </div>
          </Router>
        </DownloadProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
