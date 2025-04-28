'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../app/context/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-800">
                  Farmacia
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link href="/productos" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700">
                  Productos
                </Link>
                <Link href="/ventas" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700">
                  Ventas
                </Link>
                <Link href="/clientes" className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700">
                  Clientes
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white shadow-lg mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <p className="text-center text-gray-500">© 2024 Farmacia. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}; 