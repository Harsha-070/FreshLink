import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './pages/marketing/Landing';
import Features from './pages/marketing/Features';
import HowItWorks from './pages/marketing/HowItWorks';
import About from './pages/marketing/About';
import Contact from './pages/marketing/Contact';
import Privacy from './pages/marketing/Privacy';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VendorDashboard from './pages/vendor/Dashboard';
import StockManager from './pages/vendor/StockManager';
import SurplusHub from './pages/vendor/SurplusHub';
import VendorAnalytics from './pages/vendor/Analytics';
import VendorOrders from './pages/vendor/Orders';
import VendorSettings from './pages/vendor/Settings';
import BusinessDashboard from './pages/business/Dashboard';
import Requirements from './pages/business/Requirements';
import BusinessOrders from './pages/business/Orders';
import BusinessHistory from './pages/business/History';
import BusinessSettings from './pages/business/Settings';
import Checkout from './pages/business/Checkout';
import Marketplace from './pages/marketplace/Marketplace';
import { VendorLayout } from './components/layout/VendorLayout';
import { BusinessLayout } from './components/layout/BusinessLayout';
import { useAuthStore } from './store/useStore';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'vendor' | 'business' }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'vendor' ? '/vendor/dashboard' : '/business/dashboard'} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Marketing */}
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Legacy auth routes */}
        <Route path="/vendor/login" element={<Navigate to="/login?role=vendor" replace />} />
        <Route path="/vendor/register" element={<Navigate to="/register?role=vendor" replace />} />
        <Route path="/business/login" element={<Navigate to="/login?role=business" replace />} />
        <Route path="/business/register" element={<Navigate to="/register?role=business" replace />} />

        {/* Vendor Portal - Protected */}
        <Route path="/vendor" element={<ProtectedRoute requiredRole="vendor"><VendorLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="stock" element={<StockManager />} />
          <Route path="surplus" element={<SurplusHub />} />
          <Route path="analytics" element={<VendorAnalytics />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="settings" element={<VendorSettings />} />
        </Route>

        {/* Business Portal - Protected */}
        <Route path="/business" element={<ProtectedRoute requiredRole="business"><BusinessLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/business/dashboard" replace />} />
          <Route path="dashboard" element={<BusinessDashboard />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="orders" element={<BusinessOrders />} />
          <Route path="history" element={<BusinessHistory />} />
          <Route path="settings" element={<BusinessSettings />} />
          <Route path="checkout/:orderId" element={<Checkout />} />
        </Route>

        {/* Public Marketplace */}
        <Route path="/marketplace" element={<Marketplace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
