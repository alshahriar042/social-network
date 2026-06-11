export default function PostSkeleton() {
  const pulse = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 6,
  };

  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {[1, 2, 3].map((i) => (
        <div key={i} className="_feed_inner_area _b_radious6 _mar_b16" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ ...pulse, width: 44, height: 44, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...pulse, height: 12, width: '40%', marginBottom: 8 }} />
              <div style={{ ...pulse, height: 10, width: '25%' }} />
            </div>
          </div>
          <div style={{ ...pulse, height: 14, marginBottom: 8 }} />
          <div style={{ ...pulse, height: 14, width: '80%', marginBottom: 8 }} />
          <div style={{ ...pulse, height: 14, width: '60%' }} />
        </div>
      ))}
    </>
  );
}
