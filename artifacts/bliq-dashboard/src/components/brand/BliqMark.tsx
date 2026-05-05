interface BliqMarkProps {
  className?: string;
  gradient?: boolean;
  fill?: string;
}

export function BliqMark({ className = "h-8 w-8", gradient = true, fill }: BliqMarkProps) {
  const id = `bliq-aurora-${Math.random().toString(36).slice(2, 9)}`;
  const fillValue = fill ?? (gradient ? `url(#${id})` : "currentColor");

  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bliq"
    >
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="0.5" stopColor="#06b6d4" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M20 4C11.163 4 4 11.163 4 20c0 8.837 7.163 16 16 16 4.418 0 8.418-1.79 11.314-4.686A15.93 15.93 0 0 0 36 20c0-1.514-.21-2.978-.602-4.366C33.21 9.46 27.06 4 20 4Zm-4 8h6.5a4.5 4.5 0 0 1 1.838 8.61A5 5 0 0 1 22.5 30H16V12Zm3 3v4h3.5a2 2 0 1 0 0-4H19Zm0 7v5h3.5a2.5 2.5 0 0 0 0-5H19Z"
        fill={fillValue}
      />
    </svg>
  );
}

export function BliqWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BliqMark className="h-7 w-7" />
      <span className="font-display text-2xl font-semibold tracking-tight">Bliq</span>
    </span>
  );
}
