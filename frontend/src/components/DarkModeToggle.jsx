import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('_dark_mode', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="_layout_mode_swithing_btn" style={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
      <button
        type="button"
        className="_layout_swithing_btn_link"
        onClick={() => setDark((d) => !d)}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div className="_layout_swithing_btn">
          <div className="_layout_swithing_btn_round"></div>
        </div>
        <div className="_layout_change_btn_ic1">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
            <path fill="#fff" d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997z"/>
          </svg>
        </div>
        <div className="_layout_change_btn_ic2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)"/>
            <path stroke="#fff" strokeLinecap="round" d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05"/>
          </svg>
        </div>
      </button>
    </div>
  );
}
