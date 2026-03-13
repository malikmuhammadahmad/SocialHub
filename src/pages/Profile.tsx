import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Settings, Calendar, MapPin, Link as LinkIcon, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { formatTimeAgo } from '../utils/dateUtils';
import { motion } from 'motion/react';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setProfile(response.data.user);
      setPosts(response.data.posts);
      setIsFollowing(response.data.user.isFollowing === 1);
      setEditBio(response.data.user.bio || '');
      setEditLocation(response.data.user.location || '');
    } catch (error) {
      console.error('Error fetching profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleFollow = async () => {
    try {
      const response = await api.post('/users/follow', { followingId: id });
      setIsFollowing(response.data.following);
      setProfile({
        ...profile,
        followersCount: response.data.following ? profile.followersCount + 1 : profile.followersCount - 1
      });
    } catch (error) {
      console.error('Error following user', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await api.put('/users/update', { bio: editBio, location: editLocation });
      setProfile({ ...profile, bio: response.data.bio, location: response.data.location });
      updateUser({ bio: response.data.bio, location: response.data.location });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile', error);
    }
  };

  if (loading) return <div className="text-center py-20">Loading profile...</div>;
  if (!profile) return <div className="text-center py-20">User not found</div>;

  const isOwnProfile = currentUser?.id === parseInt(id!);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            <img
              src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.username}&size=256`}
              alt={profile.username}
              className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
            />
            <div className="flex gap-3">
              {isOwnProfile ? (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-zinc-100 text-zinc-900 px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleFollow}
                  className={`${isFollowing ? 'bg-zinc-100 text-zinc-900' : 'bg-indigo-600 text-white'} px-8 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">{profile.username}</h1>
              <p className="text-zinc-500">@{profile.username.toLowerCase()}</p>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Tell us about yourself..."
                />
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Location (e.g. San Francisco, CA)"
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateProfile} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Save</button>
                  <button onClick={() => setIsEditing(false)} className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-zinc-700 leading-relaxed max-w-2xl">
                {profile.bio || "No bio yet."}
              </p>
            )}

            <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                Joined {profile.createdAt ? format(formatTimeAgo(profile.createdAt) as Date, 'MMMM yyyy') : 'March 2026'}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {profile.location || 'No location set'}
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon size={16} />
                <a href="#" className="text-indigo-600 hover:underline">socialhub.me/{profile.username}</a>
              </div>
            </div>

            <div className="flex gap-8 pt-4 border-t border-zinc-50">
              <div className="flex items-center gap-2">
                <span className="font-black text-zinc-900 text-lg">{profile.followersCount || 0}</span>
                <span className="text-zinc-500 text-sm">Followers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-zinc-900 text-lg">{profile.followingCount || 0}</span>
                <span className="text-zinc-500 text-sm">Following</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-zinc-900 text-lg">{posts.length || 0}</span>
                <span className="text-zinc-500 text-sm">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-black px-2">Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={{...post, username: profile.username, profilePicture: profile.profilePicture}} onUpdate={fetchProfile} />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 text-zinc-400">
            No posts yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
