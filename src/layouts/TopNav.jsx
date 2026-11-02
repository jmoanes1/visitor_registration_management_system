import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider.jsx';
import { titleForPath } from '@/config/app.js';

const initialsOf = (name) =>
  name
    ? name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

const TopNav = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const closeOnClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnClickOutside);
    return () => document.removeEventListener('mousedown', closeOnClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-16">
      <div className="h-full flex items-center justify-between px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] md:hidden transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-base font-bold text-[#0F172A]">{titleForPath(pathname)}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-semibold">
                {initialsOf(user?.name)}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-semibold text-[#0F172A] max-w-[130px] truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[#64748B] capitalize">{user?.role || 'Admin'}</p>
              </div>
              <ChevronDown size={14} className="text-[#94A3B8]" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-card border border-[#E2E8F0] py-1.5 z-50">
                <div className="px-4 py-2 border-b border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#64748B] truncate">{user?.username}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-xs text-[#DC2626] hover:bg-[#F1F5F9] font-medium transition-colors"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
