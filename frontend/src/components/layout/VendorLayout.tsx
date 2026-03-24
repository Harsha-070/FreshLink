import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, TrendingDown, ClipboardList,
  BarChart3, Settings
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuthStore } from '@/store/useStore';

export function VendorLayout() {
  const location = useLocation();
  const { user, isAuthenticated, setVendorMode } = useAuthStore();

  // No auto-login - ProtectedRoute in App.tsx handles redirect to /login

  const navItems = [
    { path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/vendor/stock', icon: Package, label: 'Stock' },
    { path: '/vendor/surplus', icon: TrendingDown, label: 'Surplus' },
    { path: '/vendor/orders', icon: ClipboardList, label: 'Orders' },
    { path: '/vendor/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const sidebarNavItems = [
    { path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/vendor/stock', icon: Package, label: 'Stock Manager' },
    { path: '/vendor/surplus', icon: TrendingDown, label: 'Surplus Hub' },
    { path: '/vendor/orders', icon: ClipboardList, label: 'Orders' },
    { path: '/vendor/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex fixed left-0 top-0 bottom-0 z-40">
        <div className="p-6">
          <Link to="/">
            <h1 className="text-2xl font-bold text-emerald-400">FreshLink</h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1">Vendor Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {sidebarNavItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link
            to="/vendor/settings"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-64">
        <DashboardHeader settingsPath="/vendor/settings" />
        <div className="flex-1 overflow-auto p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav items={navItems} variant="vendor" />
    </div>
  );
}
