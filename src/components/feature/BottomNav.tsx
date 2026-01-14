
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'ri-home', label: 'Home' },
    { path: '/trips', icon: 'ri-route', label: 'Trips' },
    { path: '/earnings', icon: 'ri-wallet', label: 'Earnings' },
    { path: '/profile', icon: 'ri-user', label: 'Profile' },
  ];

  const handleNavClick = (path: string) => {
    if (location.pathname === path) {
      // If already on this page, scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to the page
      navigate(path);
    }
  };

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 px-4 py-2 shadow-lg z-50">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center justify-center py-2 active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                isActive ? 'bg-emerald-100' : ''
              }`}>
                <i className={`${item.icon}-${isActive ? 'fill' : 'line'} text-xl ${
                  isActive ? 'text-emerald-600' : 'text-gray-500'
                }`}></i>
              </div>
              <span className={`text-xs mt-1 ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
