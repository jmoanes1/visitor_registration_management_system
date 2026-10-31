import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Users2,
  BarChart3,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/visitors/register', label: 'Register Visitor', icon: UserPlus },
  { path: '/visitors', label: 'Visitor Management', icon: Users2 },
  { path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/staff', label: 'Staff Management', icon: ShieldCheck },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-none z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            {/* Clean Logo Header */}
            <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white font-bold text-sm">
                V
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#0F172A] leading-tight">VisitorReg</h1>
                <p className="text-[11px] text-[#64748B]">Enterprise System</p>
              </div>
            </div>

            {/* Nav list */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/dashboard' && location.pathname === '/');

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#EFF6FF] text-[#1E3A5F]'
                        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? 'text-[#1E3A5F]' : 'text-[#64748B]'}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer with clean logout */}
          <div className="p-4 border-t border-[#E2E8F0] space-y-3">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#DC2626] hover:bg-[#F1F5F9] transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
            <div className="text-[11px] text-[#94A3B8] text-center">
              Version 1.0.4 • Corporate
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
