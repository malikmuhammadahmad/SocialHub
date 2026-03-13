import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Check, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatTimeAgo } from '../utils/dateUtils';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: any;
  onUpdate: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked === 1);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post.id}/like`);
      setIsLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error liking post', error);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post.id}`);
      onUpdate();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting post', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${post.userId}`} className="flex items-center gap-3 group">
          <img
            src={post.profilePicture || `https://ui-avatars.com/api/?name=${post.username}`}
            alt={post.username}
            className="w-10 h-10 rounded-full object-cover border border-zinc-100"
          />
          <div>
            <h3 className="font-bold text-sm group-hover:text-indigo-600 transition-colors">{post.username}</h3>
            <p className="text-xs text-zinc-500">{formatDistanceToNow(formatTimeAgo(post.createdAt) as Date)} ago</p>
          </div>
        </Link>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 z-10"
              >
                {user?.id === post.userId && (
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Post
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Copy size={16} />
                  Copy Link
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-zinc-800 text-sm leading-relaxed">{post.caption}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="aspect-square bg-zinc-100">
          <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center justify-between border-t border-zinc-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all ${isLiked ? 'text-rose-500' : 'text-zinc-600 hover:text-rose-500'}`}
          >
            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="text-sm font-semibold">{likesCount}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-zinc-600 hover:text-indigo-600 transition-all"
          >
            <MessageCircle size={22} />
            <span className="text-sm font-semibold">Comment</span>
          </button>
          <button 
            onClick={handleShare}
            className={`flex items-center gap-2 transition-all ${copied ? 'text-emerald-500' : 'text-zinc-600 hover:text-indigo-600'}`}
          >
            {copied ? <Check size={22} /> : <Share2 size={22} />}
            <span className="text-sm font-semibold">{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-50 bg-zinc-50/50"
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Post?</h3>
              <p className="text-zinc-500 text-sm mb-6">This action cannot be undone. Are you sure you want to delete this post?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 font-semibold hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
