import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

type LayoutProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

export default function Layout({ children, requireAuth = true }: LayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push('/auth/login');
    }
  }, [loading, requireAuth, router, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si requiere autenticación y no hay usuario, no renderizar nada (se redirigirá)
  if (requireAuth && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-white mt-12 py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Sistema de Gestión Farmacéutica</p>
        </div>
      </footer>
    </div>
  );
} 