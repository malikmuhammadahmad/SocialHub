import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { Image as ImageIcon, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchFeed = async () => {
    try {
      const response = await api.get('/posts/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching feed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!caption && !image) || submitting) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('caption', caption);
    if (image) formData.append('image', image);

    try {
      const response = await api.post('/posts/create', formData);
      setPosts([response.data, ...posts]);
      setCaption('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating post', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <img
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <textarea
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 bg-zinc-50 rounded-xl p-3 outline-none resize-none h-24 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
              <button 
                type="button"
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                &times;
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
            <label className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 cursor-pointer transition-colors">
              <ImageIcon size={20} />
              <span className="text-sm font-medium">Photo</span>
              <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
            <button
              type="submit"
              disabled={(!caption && !image) || submitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send size={18} />
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10 text-zinc-500">Loading feed...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchFeed} />
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-zinc-200 text-zinc-500">
            No posts yet. Follow some users to see their posts!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
