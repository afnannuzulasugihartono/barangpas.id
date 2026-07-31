import { Navigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

export default function ProtectedAdminRoute({ children }) {
  const { isAuthed } = useAdmin();
  if (!isAuthed) return <Navigate to="/admin/login" replace />;
  return children;
}
