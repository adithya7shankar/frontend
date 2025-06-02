import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              NewsReflect
            </Link>
            <div className="space-x-4">
              <Link href="/topics" className="text-gray-600 hover:text-gray-800">
                Topics
              </Link>
              <Link href="/submit" className="text-gray-600 hover:text-gray-800">
                Share Commentary
              </Link>
              {/* TODO: Add Auth links (Login/Register/Profile) */}
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
      <footer className="bg-white mt-auto py-6 text-center text-gray-600 border-t">
        <p>&copy; {new Date().getFullYear()} NewsReflect. A space for thoughtful discussion.</p>
      </footer>
    </div>
  );
};

export default Layout;
