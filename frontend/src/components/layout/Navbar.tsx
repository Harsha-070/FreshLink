import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, ChevronRight, Bell, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated auth state
  const location = useLocation();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isHome = location.pathname === '/';

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    toast.success('Logged out successfully');
  };

  const handleMarkAllRead = () => {
    toast.success('All notifications marked as read');
    setIsNotificationsOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              FreshLink
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {isHome ? (
              <>
                <Link to="/features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</Link>
                <Link to="/how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How It Works</Link>
                <Link to="/marketplace" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Marketplace</Link>
                <div className="h-4 w-px bg-white/20" />
              </>
            ) : (
              <>
                <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                  Back to Home
                </Link>
                <div className="h-4 w-px bg-white/20" />
                <Link to="/marketplace" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Marketplace</Link>
                <Link to="/vendor/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Vendor</Link>
                <Link to="/business/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Business</Link>
                <div className="h-4 w-px bg-white/20" />
              </>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsProfileOpen(false);
                    }}
                    className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
                  </button>
                  
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                          <h3 className="font-semibold text-white">Notifications</h3>
                          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">2 New</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                            <p className="text-sm text-white mb-1">Your order #1234 has been shipped.</p>
                            <p className="text-xs text-slate-400">10 minutes ago</p>
                          </div>
                          <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                            <p className="text-sm text-white mb-1">New surplus deal available near you!</p>
                            <p className="text-xs text-slate-400">1 hour ago</p>
                          </div>
                          <div className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer opacity-60">
                            <p className="text-sm text-white mb-1">Welcome to FreshLink.</p>
                            <p className="text-xs text-slate-400">2 days ago</p>
                          </div>
                        </div>
                        <div className="p-3 border-t border-slate-800 text-center">
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
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
                    className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-800/50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                      JD
                    </div>
                    <span className="text-sm font-medium text-slate-200">John Doe</span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-800">
                          <p className="font-semibold text-white">John Doe</p>
                          <p className="text-sm text-slate-400 truncate">john.doe@example.com</p>
                        </div>
                        <div className="p-2">
                          <Link to="/business/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          <Link to="/business/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                        </div>
                        <div className="p-2 border-t border-slate-800">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Log out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <Link to="/vendor/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                    Vendor Login
                  </Button>
                </Link>
                <Link to="/business/login">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20">
                    Business Portal
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-300 hover:text-white p-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="p-6 flex justify-end">
              <button 
                className="text-slate-300 hover:text-white p-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-8 pt-12">
              {isLoggedIn && (
                <div className="flex items-center gap-4 mb-4 pb-8 border-b border-slate-800 w-full justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                    JD
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">John Doe</p>
                    <p className="text-sm text-slate-400">john.doe@example.com</p>
                  </div>
                </div>
              )}
              
              <Link 
                to="/" 
                className="text-2xl font-bold text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/marketplace" 
                className="text-2xl font-bold text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/vendor/login" 
                    className="text-2xl font-bold text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Vendor Portal
                  </Link>
                  <Link 
                    to="/business/login" 
                    className="text-2xl font-bold text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Business Portal
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/business/dashboard" 
                    className="text-2xl font-bold text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-2xl font-bold text-red-400 mt-4"
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
