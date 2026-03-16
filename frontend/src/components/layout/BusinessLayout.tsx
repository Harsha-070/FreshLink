import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Search, ChefHat, ShoppingCart, History, Settings
} from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useAuthStore } from '@/store/useStore';

export function BusinessLayout() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/business/login" replace />;
  }

  const navItems = [
    { path: '/business/dashboard', icon: Search, label: 'Discover Matches', exact: true },
    { path: '/business/requirements', icon: ChefHat, label: 'AI Meal Planner' },
    { path: '/business/orders', icon: ShoppingCart, label: 'Active Orders' },
    { path: '/business/history', icon: History, label: 'Order History' },
  ];

  const initials = user.name ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'B';

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link to="/">
            <h1 className="text-2xl font-bold text-cyan-400">FreshLink</h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1">Buyer Portal</p>
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
                  isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'
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
            to="/business/settings"
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
