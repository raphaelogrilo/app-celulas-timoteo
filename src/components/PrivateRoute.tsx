import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Protege rotas que exigem autenticação do líder.
 * Se requireAdmin=true, exige também isAdmin=true.
 */
export function PrivateRoute({ children, requireAdmin = false }: PrivateRouteProps) {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/lider" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/lider/dashboard" replace />;
  }

  return <>{children}</>;
}
