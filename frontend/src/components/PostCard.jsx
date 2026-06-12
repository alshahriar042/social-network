import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { togglePostLike, getPostLikers } from '../api/likes';
import { deletePost, getPost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LikeButton from './LikeButton';
import LikeModal from './LikeModal';
import CommentList from './CommentList';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [likers, setLikers] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [imageStatus, setImageStatus] = useState(post.image_status);
  const [imageThumb, setImageThumb] = useState(post.image_thumb);

  useEffect(() => {
    if (imageStatus !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const res = await getPost(post.id);
        if (res.data.image_status !== 'pending') {
          setImageStatus(res.data.image_status);
          setImageThumb(res.data.image_thumb);
        }
      } catch {
        // ignore and retry on the next tick
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [imageStatus, post.id]);

  async function handleToggleLike() {
    // optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      const res = await togglePostLike(post.id);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
    } catch {
      // rollback on failure
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  }

  async function handleShowLikers() {
    const res = await getPostLikers(post.id);
    setLikers(res.data.data);
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      queryClient.resetQueries({ queryKey: ['posts'] });
      addToast('Post deleted.');
    } catch {
      addToast('Could not delete post.', 'error');
    }
  }

  const initials = `${post.author?.first_name?.[0] || ''}${post.author?.last_name?.[0] || ''}`;

  return (
    <div className="_feed_inner_area _b_radious6 _mar_b16">
      {/* Post Header */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#377DFF', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{post.author?.full_name}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#aaa' }}>{post.created_at}</span>
              <span style={{
                fontSize: 11, padding: '1px 8px', borderRadius: 20,
                background: post.visibility === 'private' ? '#fff3cd' : '#e0f0ff',
                color: post.visibility === 'private' ? '#856404' : '#377DFF',
              }}>
                {post.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
              </span>
            </div>
          </div>
        </div>
        {user?.id === post.author?.id && (
          <button
            onClick={handleDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16, padding: 4 }}
            title="Delete post"
          >
            ×
          </button>
        )}
      </div>

      {/* Post Body */}
      {post.body && (
        <div style={{ padding: '0 20px 12px' }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#333' }}>{post.body}</p>
        </div>
      )}

      {/* Post Image */}
      {post.image && (
        <div style={{ marginBottom: 12, position: 'relative' }}>
          <img
            src={imageThumb || post.image}
            alt="Post"
            style={{
              width: '100%', maxHeight: 500, objectFit: 'contain', background: '#f7f7f7',
              filter: imageStatus === 'pending' ? 'blur(3px)' : 'none',
            }}
          />
          {imageStatus === 'pending' && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'rgba(255,255,255,0.4)',
            }}>
              <span className="_post_processing_spinner" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#377DFF', background: '#fff', padding: '2px 10px', borderRadius: 12 }}>
                Processing image...
              </span>
            </div>
          )}
          {imageStatus === 'failed' && (
            <div style={{
              position: 'absolute', bottom: 8, left: 8,
              background: 'rgba(231,76,60,0.9)', color: '#fff',
              fontSize: 12, padding: '2px 8px', borderRadius: 4,
            }}>
              Image processing failed
            </div>
          )}
          <style>{`
            ._post_processing_spinner {
              width: 28px; height: 28px;
              border: 3px solid #e0e7ff;
              border-top-color: #377DFF;
              border-radius: 50%;
              animation: post-processing-spin 0.8s linear infinite;
            }
            @keyframes post-processing-spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {/* Like / Comment bar */}
      <div style={{ padding: '8px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 20, alignItems: 'center' }}>
        <LikeButton
          count={likeCount}
          likedByMe={liked}
          onToggle={handleToggleLike}
          onShowLikers={handleShowLikers}
        />
        <button
          onClick={() => setShowComments((s) => !s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 13, padding: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.comments_count} {post.comments_count === 1 ? 'Comment' : 'Comments'}
        </button>
      </div>

      {/* Comments section */}
      {showComments && <CommentList postId={post.id} />}

      {likers && <LikeModal likers={likers} onClose={() => setLikers(null)} />}
    </div>
  );
}
