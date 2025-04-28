"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [loading, router, user]);

  // Si el usuario ya está autenticado, no mostrar nada (se redirigirá)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Farmacia</h1>
          <p className="mt-2 text-gray-600">Sistema de Gestión</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 