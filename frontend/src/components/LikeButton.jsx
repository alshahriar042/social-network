import { useState } from 'react';

export default function LikeButton({ count, likedByMe, onToggle, onShowLikers }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    try {
      await onToggle();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="_post_reactions_item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="_post_reactions_link"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          stroke={likedByMe ? '#377DFF' : '#666'}
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            fill={likedByMe ? '#377DFF' : 'none'}
            d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3z"
          />
          <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onShowLikers}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#666', fontSize: '13px' }}
      >
        {count}
      </button>
    </div>
  );
}
