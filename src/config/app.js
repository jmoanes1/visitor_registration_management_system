import {
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  UserPlus,
  Users2,
} from 'lucide-react';

// Shown in the sidebar footer and on the sign-in card.
export const APP_VERSION = '1.0.4';

// The sidebar links and the top bar title both come from this list, so a new
// screen only has to be added once.
export const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/visitors/register', label: 'Register Visitor', icon: UserPlus },
  { path: '/visitors', label: 'Visitor Management', icon: Users2 },
  { path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/staff', label: 'Staff Management', icon: ShieldCheck },
];

export const isActivePath = (pathname, item) => {
  if (item.path === '/dashboard') return pathname === '/' || pathname === '/dashboard';
  return pathname === item.path;
};

export const titleForPath = (pathname) => {
  if (pathname.startsWith('/visitors/') && pathname.endsWith('/edit')) {
    return 'Edit Visitor Registration';
  }

  const item = navItems.find((navItem) => isActivePath(pathname, navItem));
  return item?.label || 'Visitor Registration';
};
