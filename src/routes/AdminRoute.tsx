import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AdminRoute() {
  const { user, profile, loading, configured } = useAuth()
  if (!configured) return <Navigate to="/login" replace state={{ message: 'Configure o Firebase para acessar a administração.' }} />
  if (loading) return <div className="route-loading">Validando acesso...</div>
  if (!user) return <Navigate to="/login" replace />
  return profile?.role === 'admin' ? <Outlet /> : <Navigate to="/vagas" replace />
}
