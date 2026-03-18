import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useStore';

interface DashboardHeaderProps {
  settingsPath?: string;
}

export function DashboardHeader({ settingsPath }: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleMarkAllRead = () => {
    toast.success('All notifications marked as read');
    setIsNotificationsOpen(false);
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Get settings link based on role
  const getSettingsLink = () => {
    if (settingsPath) return settingsPath;
    return user?.role === 'vendor' ? '/vendor/settings' : '/business/settings';
  };

  // Get dashboard link based on role
  const getDashboardLink = () => {
    return user?.role === 'vendor' ? '/vendor/dashboard' : '/business/dashboard';
  };

  const userName = user?.name || 'User';
  const userEmail = user?.email || user?.phone || '';

  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={() => navigate(-1)}
          className="md:hidden p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center bg-slate-100 rounded-full px-3 md:px-4 py-2 flex-1 max-w-md">
          <Search className="w-4 md:w-5 h-4 md:h-5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 ml-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 relative text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Notifications</h3>
                  <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full font-medium">2 New</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="text-sm text-slate-800 mb-1 font-medium">Your order #1234 has been shipped.</p>
                    <p className="text-xs text-slate-500">10 minutes ago</p>
                  </div>
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="text-sm text-slate-800 mb-1 font-medium">New surplus deal available near you!</p>
                    <p className="text-xs text-slate-500">1 hour ago</p>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer opacity-60">
                    <p className="text-sm text-slate-800 mb-1">Welcome to FreshLink.</p>
                    <p className="text-xs text-slate-500">2 days ago</p>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 pr-2 md:pr-3 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 transition-all"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 text-sm md:text-base shrink-0">
              {getUserInitials()}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">{userName}</span>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <p className="font-semibold text-slate-800">{userName}</p>
                  <p className="text-sm text-slate-500 truncate">{userEmail}</p>
                  {user?.role && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full capitalize">
                      {user.role}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <User className="w-4 h-4" /> My Dashboard
                  </Link>
                  <Link
                    to={getSettingsLink()}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
