import React, { useEffect, useRef, useState } from 'react';

export default function Carousel({ images = [], interval = 4000, height = 340, ratio = 16 ,radius = 18 }) {
  const [i, setI] = useState(0);
  const timer = useRef(null);

  const go = (idx) => setI((idx + images.length) % images.length);
  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  useEffect(() => {
    if (!images.length) return;
    timer.current = setInterval(next, interval);
    return () => clearInterval(timer.current);
  }, [i, images, interval]);

  function pause(){ if (timer.current) clearInterval(timer.current); }
  function resume(){
    if (!images.length) return;
    timer.current = setInterval(next, interval);
  }

  return (
    <div className="carousel" style={{borderRadius: radius, height}} onMouseEnter={pause} onMouseLeave={resume}>
      {images.map((img, idx) => (
        <div className={`slide ${idx===i?'active':''}`} key={idx}>
          <img src={img.src} alt={img.alt || `slide-${idx}`} />
          {(img.caption || img.title) && (
            <div className="caption">
              {img.title && <div className="cap-title">{img.title}</div>}
              {img.caption && <div className="cap-sub">{img.caption}</div>}
            </div>
          )}
        </div>
      ))}
      {images.length > 1 && (
        <>
          <button className="nav left" onClick={prev} aria-label="Previous">‹</button>
          <button className="nav right" onClick={next} aria-label="Next">›</button>
          <div className="dots">
            {images.map((_, idx) => (
              <button key={idx} className={`dot ${idx===i?'active':''}`} onClick={()=>go(idx)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
