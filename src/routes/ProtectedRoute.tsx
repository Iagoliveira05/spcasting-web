import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute() {
  const { user, loading, configured } = useAuth()
  if (!configured) return <Navigate to="/login" replace state={{ message: 'Configure o Firebase para acessar sua conta.' }} />
  if (loading) return <div className="route-loading">Carregando sua conta...</div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
