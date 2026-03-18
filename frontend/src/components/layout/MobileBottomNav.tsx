import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
}

interface MobileBottomNavProps {
  items: NavItem[];
  variant?: 'vendor' | 'business';
}

export function MobileBottomNav({ items, variant = 'vendor' }: MobileBottomNavProps) {
  const location = useLocation();

  const activeColor = variant === 'vendor' ? 'text-emerald-500' : 'text-cyan-500';
  const activeBg = variant === 'vendor' ? 'bg-emerald-50' : 'bg-cyan-50';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center py-2 px-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className={`absolute inset-x-2 top-0 h-0.5 ${variant === 'vendor' ? 'bg-emerald-500' : 'bg-cyan-500'} rounded-full`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? activeBg : ''}`}>
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? activeColor : 'text-slate-400'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${
                  isActive ? activeColor : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
