/** Ambient orbital watermark — platform-default Constellation inheritance (M4 → W4). */
export function PlatformDefaultAmbient() {
  const stars = [
    [118, 92, 1.2],
    [168, 140, 0.9],
    [210, 88, 1],
    [278, 118, 1.1],
    [320, 168, 0.85],
    [362, 228, 1],
    [388, 290, 0.95],
    [340, 348, 1.15],
    [268, 372, 0.9],
    [198, 352, 1],
    [142, 302, 0.85],
    [98, 228, 1],
    [248, 248, 1.4],
    [292, 198, 0.75],
    [188, 198, 0.8],
  ] as const;

  return (
    <div className="platform-default-ambient" aria-hidden>
      <div className="platform-default-ambient__nebula platform-default-ambient__nebula--violet" />
      <div className="platform-default-ambient__nebula platform-default-ambient__nebula--cyan" />
      <svg className="platform-default-ambient__svg" viewBox="0 0 500 500">
        <defs>
          <linearGradient id="pd-orbit-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d9c39a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8a7549" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="pd-star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d9c39a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d9c39a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="250" cy="250" r="175" fill="none" stroke="url(#pd-orbit-gold)" strokeWidth="1" />
        <circle cx="250" cy="250" r="108" fill="none" stroke="rgba(217,195,154,0.35)" strokeWidth="0.75" />
        <ellipse cx="250" cy="250" rx="175" ry="72" fill="none" stroke="rgba(217,195,154,0.22)" strokeWidth="0.75" />
        <ellipse cx="250" cy="250" rx="72" ry="175" fill="none" stroke="rgba(217,195,154,0.22)" strokeWidth="0.75" />
        {stars.map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r * 3} fill="url(#pd-star-glow)" opacity="0.35" />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="#d9c39a"
              opacity="0.75"
              className={
                i === 0 ? "pd-star-twinkle" : i === 5 ? "pd-star-twinkle pd-star-twinkle--b" : i === 12 ? "pd-star-twinkle pd-star-twinkle--c" : undefined
              }
            />
          </g>
        ))}
        <line x1="118" y1="92" x2="168" y2="140" stroke="rgba(217,195,154,0.12)" strokeWidth="0.5" />
        <line x1="168" y1="140" x2="210" y2="88" stroke="rgba(217,195,154,0.1)" strokeWidth="0.5" />
        <line x1="210" y1="88" x2="278" y2="118" stroke="rgba(217,195,154,0.1)" strokeWidth="0.5" />
        <line x1="278" y1="118" x2="320" y2="168" stroke="rgba(217,195,154,0.08)" strokeWidth="0.5" />
        <line x1="320" y1="168" x2="362" y2="228" stroke="rgba(217,195,154,0.08)" strokeWidth="0.5" />
        <line x1="142" y1="302" x2="198" y2="352" stroke="rgba(217,195,154,0.1)" strokeWidth="0.5" />
        <line x1="198" y1="352" x2="268" y2="372" stroke="rgba(217,195,154,0.08)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
