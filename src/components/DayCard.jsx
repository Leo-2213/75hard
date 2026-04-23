// =====================================================
// src/components/DayCard.jsx
// Individual day card in the 75-day grid
// =====================================================
import React from 'react';

/**
 * Props:
 *   dayNum   {number}   - Day number (1–75)
 *   data     {object}   - Progress data for this day (may be undefined)
 *   today    {number}   - Which day is "today" (1-indexed)
 *   onClick  {function} - Called when card is clicked
 */
export default function DayCard({ dayNum, data, today, onClick }) {
  // ── Determine card state ──
  const isCompleted = data?.completed === true;
  const isToday     = dayNum === today;
  const isFuture    = dayNum > today;
  const isPast      = dayNum < today && !isCompleted;

  // ── Pick background color based on state ──
  const bg = isCompleted
    ? 'linear-gradient(135deg, #c8f0de 0%, #a8e6cc 100%)'   // soft mint green
    : isToday
    ? 'linear-gradient(135deg, var(--lavender) 0%, var(--blue-soft) 100%)'
    : isFuture
    ? 'var(--cream-deep)'
    : 'linear-gradient(135deg, var(--peach) 0%, #ffe8d0 100%)'; // past incomplete

  const cardStyle = {
    position: 'relative',
    background: bg,
    borderRadius: 'var(--r-md)',
    padding: '14px 10px 12px',
    cursor: isFuture ? 'default' : 'pointer',
    boxShadow: isCompleted
      ? '5px 5px 14px rgba(80,180,130,0.25), -3px -3px 10px rgba(255,255,255,0.85), inset 1px 1px 3px rgba(255,255,255,0.7)'
      : isToday
      ? '6px 6px 18px rgba(150,120,200,0.28), -4px -4px 12px rgba(255,255,255,0.9), inset 1px 1px 3px rgba(255,255,255,0.75)'
      : '4px 4px 12px rgba(150,120,200,0.15), -3px -3px 9px rgba(255,255,255,0.8)',
    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    textAlign: 'center',
    userSelect: 'none',
    opacity: isFuture ? 0.45 : 1,
    minWidth: 0,
  };

  const handleMouseEnter = (e) => {
    if (isFuture) return;
    e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)';
    e.currentTarget.style.boxShadow = isCompleted
      ? '8px 8px 20px rgba(80,180,130,0.35), -5px -5px 14px rgba(255,255,255,0.92)'
      : '9px 9px 22px rgba(150,120,200,0.3), -5px -5px 14px rgba(255,255,255,0.92)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = cardStyle.boxShadow;
  };

  const handleMouseDown = (e) => {
    if (isFuture) return;
    e.currentTarget.style.transform = 'translateY(1px) scale(0.97)';
    e.currentTarget.style.boxShadow = 'inset 3px 3px 8px rgba(150,120,200,0.25), inset -2px -2px 6px rgba(255,255,255,0.7)';
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = '';
    e.currentTarget.style.boxShadow = cardStyle.boxShadow;
  };

  return (
    <div
      style={cardStyle}
      onClick={() => !isFuture && onClick(dayNum)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      role={isFuture ? undefined : 'button'}
      aria-label={`Day ${dayNum}${isCompleted ? ' — completed' : isToday ? ' — today' : ''}`}
    >
      {/* Today indicator ring */}
      {isToday && (
        <div style={{
          position: 'absolute',
          inset: -3,
          borderRadius: 'calc(var(--r-md) + 3px)',
          border: '2.5px solid var(--lavender-dark)',
          pointerEvents: 'none',
          animation: 'pulse-ring 2s ease-in-out infinite',
        }} />
      )}

      {/* Day number */}
      <div style={{
        fontSize: '0.72rem',
        fontWeight: 800,
        color: isCompleted ? '#3a9e72' : isToday ? 'var(--lavender-dark)' : 'var(--text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: 2,
      }}>
        DAY
      </div>

      <div style={{
        fontSize: '1.2rem',
        fontWeight: 900,
        color: isCompleted ? '#2d7a57' : isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
        lineHeight: 1,
      }}>
        {dayNum}
      </div>

      {/* Status icon */}
      <div style={{ marginTop: 6, fontSize: '1rem', lineHeight: 1 }}>
        {isCompleted  ? '✅' : isToday ? '⚡' : isFuture ? '🔒' : '○'}
      </div>

      {/* Mini progress dots for partial completion */}
      {!isCompleted && !isFuture && data && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          marginTop: 5,
        }}>
          {getProgressDots(data).map((filled, i) => (
            <div key={i} style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: filled ? 'var(--lavender-dark)' : 'var(--lavender-mid)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Returns 5 boolean values representing completion of each task
 */
function getProgressDots(data) {
  return [
    data?.workout1?.length > 0,
    data?.workout2?.length > 0,
    data?.water >= 4,
    data?.diet === true,
    data?.reading === true,
  ];
}
