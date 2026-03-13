import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatTimeAgo } from '../utils/dateUtils';

interface CommentSectionProps {
  postId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post('/comments', { postId, text: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-center text-xs text-zinc-400">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.profilePicture || `https://ui-avatars.com/api/?name=${comment.username}`}
                alt={comment.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 bg-white p-2 rounded-xl border border-zinc-100 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs">{comment.username}</span>
                  <span className="text-[10px] text-zinc-400">{formatDistanceToNow(formatTimeAgo(comment.createdAt) as Date)} ago</span>
                </div>
                <p className="text-sm text-zinc-700">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-xs text-zinc-400">No comments yet. Be the first!</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
