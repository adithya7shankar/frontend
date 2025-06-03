import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-warm-bg">
      <header className="bg-warm-surface shadow-sm border-b border-warm-border-soft">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-calm-blue-accent hover:text-calm-blue-accent-hover">
              NewsReflect
            </Link>
            <div className="space-x-6">
              <Link href="/topics" className="text-warm-text-secondary hover:text-warm-text-primary transition-colors">
                Explore Topics
              </Link>
              <Link href="/submit" className="text-warm-text-secondary hover:text-warm-text-primary transition-colors">
                Share Reflection
              </Link>
              {/* TODO: Add Auth links (Login/Register/Profile) */}
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-10 flex-grow"> {/* Increased py for more vertical space */}
        {children}
      </main>
      <footer className="bg-warm-surface mt-auto py-8 text-center text-warm-text-secondary border-t border-warm-border-soft">
        <p>&copy; {new Date().getFullYear()} NewsReflect. A space for thoughtful discussion.</p>
        {/* Consider adding a link to an "About" or "Our Philosophy" page here */}
      </footer>
    </div>
  );
};

export default Layout;
