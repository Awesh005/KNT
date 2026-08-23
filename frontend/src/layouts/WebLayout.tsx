import { Outlet } from 'react-router';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FloatingContact } from '@/components/common/FloatingContact';

export function WebLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-light-green via-white to-soft-green">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        {/* pt-[72px] offsets the fixed navbar height */}
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
