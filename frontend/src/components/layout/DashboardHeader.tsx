import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useStore';

interface DashboardHeaderProps {
  userInitials: string;
  userName: string;
  userEmail: string;
}

export function DashboardHeader({ userInitials, userName, userEmail }: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

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

  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleMarkAllRead = () => {
    toast.success('All notifications marked as read');
    setIsNotificationsOpen(false);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="md:hidden p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-full max-w-md">
        <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search orders, stock..."
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
              {userInitials}
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
                </div>
                <div className="p-2">
                  <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
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
