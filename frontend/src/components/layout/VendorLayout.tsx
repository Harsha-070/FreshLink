import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, TrendingDown, ClipboardList,
  BarChart3, Settings
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useAuthStore } from '@/store/useStore';

export function VendorLayout() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/vendor/login" replace />;
  }

  const navItems = [
    { path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/vendor/stock', icon: Package, label: 'Stock Manager' },
    { path: '/vendor/surplus', icon: TrendingDown, label: 'Surplus Hub' },
    { path: '/vendor/orders', icon: ClipboardList, label: 'Orders' },
    { path: '/vendor/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const initials = user.name ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'V';

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link to="/">
            <h1 className="text-2xl font-bold text-emerald-400">FreshLink</h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1">Vendor Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
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

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <DashboardHeader
          userInitials={initials}
          userName={user.name}
          userEmail={user.email || ''}
        />
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
