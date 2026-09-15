import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import PublicMap from './pages/PublicMap';
import LeaderLogin from './pages/LeaderLogin';
import LeaderDashboard from './pages/LeaderDashboard';
import CelulaForm from './pages/CelulaForm';
import ItineranteUpdate from './pages/ItineranteUpdate';
import MembrosGestao from './pages/MembrosGestao';
import ChamadaEncontro from './pages/ChamadaEncontro';
import AdminPanel from './pages/AdminPanel';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Mapa Público — sem autenticação */}
          <Route path="/" element={<PublicMap />} />

          {/* Área do Líder / Login */}
          <Route path="/lider" element={<LeaderLogin />} />
          <Route path="/lider/login" element={<LeaderLogin />} />
          <Route path="/login" element={<LeaderLogin />} />

          <Route
            path="/lider/dashboard"
            element={
              <PrivateRoute>
                <LeaderDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/lider/membros"
            element={
              <PrivateRoute>
                <MembrosGestao />
              </PrivateRoute>
            }
          />

          <Route
            path="/lider/chamada"
            element={
              <PrivateRoute>
                <ChamadaEncontro />
              </PrivateRoute>
            }
          />

          <Route
            path="/lider/cadastro"
            element={
              <PrivateRoute>
                <CelulaForm mode="create" />
              </PrivateRoute>
            }
          />

          <Route
            path="/lider/editar"
            element={
              <PrivateRoute>
                <CelulaForm mode="edit" />
              </PrivateRoute>
            }
          />

          <Route
            path="/lider/itinerante"
            element={
              <PrivateRoute>
                <ItineranteUpdate />
              </PrivateRoute>
            }
          />

          {/* Painel Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          {/* Rota Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
