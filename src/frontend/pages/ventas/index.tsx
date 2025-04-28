'use client';

import { MainLayout } from '../../components/layout/MainLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function VentasPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">Ventas</h1>
          <p>Página en construcción...</p>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
} 