import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getComments, addComment } from '../api/comments';
import CommentItem from './CommentItem';

export default function CommentList({ postId }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId).then((r) => r.data.data),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await addComment(postId, text.trim());
      setText('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          style={{ flex: 1, padding: '8px 14px', borderRadius: 20, border: '1px solid #ddd', fontSize: 13, outline: 'none' }}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          style={{ background: '#377DFF', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}
        >
          {submitting ? '...' : 'Post'}
        </button>
      </form>

      {isLoading ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>Loading comments...</p>
      ) : data?.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>No comments yet. Be the first!</p>
      ) : (
        data?.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))
      )}
    </div>
  );
}
