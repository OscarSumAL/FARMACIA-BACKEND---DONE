'use client';

import { MainLayout } from '../../components/layout/MainLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ClientesPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
          <p>Página en construcción...</p>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
} 