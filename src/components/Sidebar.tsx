import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, MessageSquare, Bell, Settings, Bookmark, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Hash, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: MessageSquare, label: 'Messages', path: '/chat' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: User, label: 'Profile', path: `/profile/${user?.id}` },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="sticky top-24 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-50 flex items-center gap-3">
          <img
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}`}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate">{user?.username}</h3>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <nav className="p-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-bold' 
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <item.icon size={22} className={isActive ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-900'} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <h4 className="font-bold mb-2">Go Premium</h4>
        <p className="text-xs text-indigo-100 mb-4 leading-relaxed">Get verified badge and access to exclusive features.</p>
        <button className="w-full bg-white text-indigo-600 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors">
          Upgrade Now
        </button>
      </div>

      <div className="px-4 text-[10px] text-zinc-400 flex flex-wrap gap-x-3 gap-y-1">
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Terms</a>
        <a href="#" className="hover:underline">Cookies</a>
        <a href="#" className="hover:underline">More</a>
        <span>© 2026 SocialHub</span>
      </div>
    </div>
  );
};

export default Sidebar;
