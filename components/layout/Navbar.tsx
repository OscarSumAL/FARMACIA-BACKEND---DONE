import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  nombre: string;
  email: string;
  role: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Cargar usuario desde localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl">Farmacia</span>
            </Link>

            {user && (
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Dashboard
                </Link>
                <Link href="/productos" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Productos
                </Link>
                <Link href="/clientes" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Clientes
                </Link>
                <Link href="/ventas" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Ventas
                </Link>
                <Link href="/ventas/nueva" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Nueva Venta
                </Link>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center">
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <span className="mr-4">{user.nombre}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>

              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {menuOpen && user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
              Dashboard
            </Link>
            <Link href="/productos" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
              Productos
            </Link>
            <Link href="/clientes" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
              Clientes
            </Link>
            <Link href="/ventas" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
              Ventas
            </Link>
            <Link href="/ventas/nueva" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700">
              Nueva Venta
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-red-500 hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 