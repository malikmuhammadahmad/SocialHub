import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data);
        // Mark as read
        await api.put('/notifications/read-all');
      } catch (error) {
        console.error('Error fetching notifications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={18} className="text-rose-500" fill="currentColor" />;
      case 'comment': return <MessageCircle size={18} className="text-indigo-500" />;
      case 'follow': return <UserPlus size={18} className="text-emerald-500" />;
      default: return <Bell size={18} className="text-zinc-400" />;
    }
  };

  const getMessage = (type: string) => {
    switch (type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      default: return 'sent you a notification';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
          {notifications.filter(n => n.readStatus === 0).length} New
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-zinc-400">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-zinc-50">
            {notifications.map((notif, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={notif.id}
                className={`p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors ${notif.readStatus === 0 ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="relative">
                  <img
                    src={notif.senderPhoto || `https://ui-avatars.com/api/?name=${notif.senderName}`}
                    alt={notif.senderName}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-100"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-zinc-50">
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-800">
                    <Link to={`/profile/${notif.senderId}`} className="font-bold hover:text-indigo-600 transition-colors">
                      {notif.senderName}
                    </Link>{' '}
                    {getMessage(notif.type)}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt))} ago
                  </p>
                </div>
                {notif.referenceId && (
                  <Link 
                    to={`/profile/${notif.userId}`} // In a real app, link to the specific post
                    className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0"
                  >
                    {/* Placeholder for post thumbnail */}
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold uppercase">Post</div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-zinc-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">No notifications yet</p>
            <p className="text-sm">When people interact with you, you'll see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
