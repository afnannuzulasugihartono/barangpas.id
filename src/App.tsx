import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SourceProvider } from './contexts/SourceContext';
import { AdminProvider } from './contexts/AdminContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Home from './pages/Home';
import Category from './pages/Category';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function App() {
  return (
    <AdminProvider>
      <SourceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kategori/:slug" element={<Category />} />
            <Route path="/cari" element={<Search />} />
            <Route path="/produk/:id" element={<ProductDetail />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SourceProvider>
    </AdminProvider>
  );
}

export default App;
