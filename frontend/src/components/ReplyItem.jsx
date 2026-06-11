import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toggleCommentLike, getCommentLikers } from '../api/likes';
import { deleteReply } from '../api/comments';
import { useAuth } from '../context/AuthContext';
import LikeButton from './LikeButton';
import LikeModal from './LikeModal';

export default function ReplyItem({ reply, postId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(reply.liked_by_me);
  const [likeCount, setLikeCount] = useState(reply.likes_count);
  const [likers, setLikers] = useState(null);

  async function handleToggleLike() {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      const res = await toggleCommentLike(reply.id);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  }

  async function handleShowLikers() {
    const res = await getCommentLikers(reply.id);
    setLikers(res.data.data);
  }

  async function handleDelete() {
    if (!confirm('Delete this reply?')) return;
    await deleteReply(reply.id);
    queryClient.invalidateQueries({ queryKey: ['comments', postId] });
  }

  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#377DFF', flexShrink: 0 }}>
        {reply.author?.first_name?.[0]}{reply.author?.last_name?.[0]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ background: '#f7f7f7', borderRadius: 8, padding: '8px 12px' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{reply.author?.full_name}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#333' }}>{reply.body}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
          <LikeButton
            count={likeCount}
            likedByMe={liked}
            onToggle={handleToggleLike}
            onShowLikers={handleShowLikers}
          />
          <span style={{ fontSize: 11, color: '#aaa' }}>{reply.created_at}</span>
          {user?.id === reply.author?.id && (
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: 12, cursor: 'pointer', padding: 0 }}>
              Delete
            </button>
          )}
        </div>
      </div>
      {likers && <LikeModal likers={likers} onClose={() => setLikers(null)} />}
    </div>
  );
}
