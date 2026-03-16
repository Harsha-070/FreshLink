import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './pages/marketing/Landing';
import Features from './pages/marketing/Features';
import HowItWorks from './pages/marketing/HowItWorks';
import About from './pages/marketing/About';
import Contact from './pages/marketing/Contact';
import Privacy from './pages/marketing/Privacy';
import VendorLogin from './pages/auth/VendorLogin';
import VendorRegister from './pages/auth/VendorRegister';
import BusinessLogin from './pages/auth/BusinessLogin';
import BusinessRegister from './pages/auth/BusinessRegister';
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

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Marketing Funnel */}
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        
        {/* Auth */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/business/login" element={<BusinessLogin />} />
        <Route path="/business/register" element={<BusinessRegister />} />
        
        {/* Vendor Portal */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="stock" element={<StockManager />} />
          <Route path="surplus" element={<SurplusHub />} />
          <Route path="analytics" element={<VendorAnalytics />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="settings" element={<VendorSettings />} />
        </Route>
        
        {/* Business Portal */}
        <Route path="/business" element={<BusinessLayout />}>
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
