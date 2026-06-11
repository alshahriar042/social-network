import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toggleCommentLike, getCommentLikers } from '../api/likes';
import { addReply, deleteComment } from '../api/comments';
import { useAuth } from '../context/AuthContext';
import LikeButton from './LikeButton';
import LikeModal from './LikeModal';
import ReplyItem from './ReplyItem';

export default function CommentItem({ comment, postId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(comment.liked_by_me);
  const [likeCount, setLikeCount] = useState(comment.likes_count);
  const [likers, setLikers] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleToggleLike() {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      const res = await toggleCommentLike(comment.id);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  }

  async function handleShowLikers() {
    const res = await getCommentLikers(comment.id);
    setLikers(res.data.data);
  }

  async function handleDelete() {
    if (!confirm('Delete this comment?')) return;
    await deleteComment(comment.id);
    queryClient.invalidateQueries({ queryKey: ['comments', postId] });
  }

  async function handleReplySubmit(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await addReply(comment.id, replyText.trim());
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setShowReplies(true);
    } finally {
      setSubmitting(false);
    }
  }

  const replies = comment.replies || [];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#377DFF', flexShrink: 0 }}>
          {comment.author?.first_name?.[0]}{comment.author?.last_name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ background: '#f7f7f7', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{comment.author?.full_name}</p>
            <p style={{ margin: 0, fontSize: 14, color: '#333' }}>{comment.body}</p>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 6, alignItems: 'center' }}>
            <LikeButton
              count={likeCount}
              likedByMe={liked}
              onToggle={handleToggleLike}
              onShowLikers={handleShowLikers}
            />
            <button
              onClick={() => setShowReplies((s) => !s)}
              style={{ background: 'none', border: 'none', color: '#377DFF', fontSize: 12, cursor: 'pointer', padding: 0 }}
            >
              Reply {replies.length > 0 && `(${replies.length})`}
            </button>
            <span style={{ fontSize: 11, color: '#aaa' }}>{comment.created_at}</span>
            {user?.id === comment.author?.id && (
              <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                Delete
              </button>
            )}
          </div>

          {showReplies && (
            <div style={{ marginLeft: 10, marginTop: 10 }}>
              {replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} postId={postId} />
              ))}
              <form onSubmit={handleReplySubmit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, outline: 'none' }}
                />
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  style={{ background: '#377DFF', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
                >
                  {submitting ? '...' : 'Reply'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      {likers && <LikeModal likers={likers} onClose={() => setLikers(null)} />}
    </div>
  );
}
