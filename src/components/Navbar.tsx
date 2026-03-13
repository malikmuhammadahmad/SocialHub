import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, User, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const response = await api.get(`/users/search/${query}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">SocialHub</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8 relative hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-zinc-100 border-none rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  to={`/profile/${result.id}`}
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors"
                >
                  <img
                    src={result.profilePicture || `https://ui-avatars.com/api/?name=${result.username}`}
                    alt={result.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium text-sm">{result.username}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors md:hidden">
            <Home size={22} />
          </Link>
          <Link to="/chat" className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors relative">
            <MessageSquare size={22} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
          </Link>
          <Link to="/notifications" className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
            <Bell size={22} />
          </Link>
          <div className="h-8 w-[1px] bg-zinc-200 mx-1 hidden sm:block"></div>
          <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 p-1 pr-3 hover:bg-zinc-100 rounded-xl transition-colors">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}`}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-semibold hidden sm:block">{user?.username}</span>
          </Link>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
