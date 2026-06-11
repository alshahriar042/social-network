import { useEffect, useRef } from 'react';

export default function LikeModal({ likers, onClose }) {
  const ref = useRef();

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={ref} style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 280, maxHeight: 400, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h6 style={{ margin: 0, fontWeight: 600 }}>Liked by</h6>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        {likers.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>No likes yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {likers.map((like, i) => (
              <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14 }}>
                {like.user?.full_name || like.user?.email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
