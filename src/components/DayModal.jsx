// =====================================================
// src/components/DayModal.jsx
// Animated modal for tracking daily 75 Hard tasks
// =====================================================
import React, { useState, useEffect, useCallback } from 'react';

// ── Workout icon options ──────────────────────────────
const WORKOUT_OPTIONS = [
  { id: 'gym',  label: 'Gym',  emoji: '🏋️' },
  { id: 'walk', label: 'Walk', emoji: '🚶' },
  { id: 'run',  label: 'Run',  emoji: '🏃' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'swim', label: 'Swim', emoji: '🏊' },
  { id: 'bike', label: 'Bike', emoji: '🚴' },
];

// ── Styles ─────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(61, 48, 81, 0.35)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    animation: 'fadeIn 0.25s ease both',
  },

  modal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'rgba(250, 247, 242, 0.97)',
    borderRadius: 'var(--r-xl)',
    boxShadow: 'var(--clay-modal)',
    animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
    padding: '32px 28px 28px',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: 'var(--lavender)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    boxShadow: 'var(--clay-raised)',
    flexShrink: 0,
    transition: 'all var(--t-fast)',
  },

  section: {
    marginBottom: 22,
    background: 'var(--lavender)',
    borderRadius: 'var(--r-lg)',
    padding: '16px 18px',
    boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.6), inset -1px -1px 4px rgba(160,130,210,0.1)',
  },

  sectionTitle: {
    fontSize: '0.82rem',
    fontWeight: 800,
    color: 'var(--text-secondary)',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  workoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },

  workoutChip: (selected) => ({
    padding: '10px 8px',
    borderRadius: 'var(--r-md)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: '0.8rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    background: selected ? 'white' : 'var(--cream)',
    color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
    boxShadow: selected
      ? 'var(--clay-raised)'
      : 'inset 2px 2px 5px rgba(160,130,210,0.12), inset -1px -1px 4px rgba(255,255,255,0.5)',
    transform: selected ? 'scale(1.04)' : 'scale(1)',
  }),

  waterRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  bottle: (filled) => ({
    fontSize: '2rem',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    filter: filled
      ? 'drop-shadow(0 3px 6px rgba(80,160,220,0.4)) saturate(1.3)'
      : 'grayscale(0.7) opacity(0.45)',
    transform: filled ? 'scale(1.15) translateY(-3px)' : 'scale(1)',
    userSelect: 'none',
  }),

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  toggleLabel: {
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  toggle: (on) => ({
    width: 52,
    height: 28,
    borderRadius: 'var(--r-full)',
    background: on
      ? 'linear-gradient(135deg, var(--mint-dark) 0%, #50c090 100%)'
      : 'var(--cream-deep)',
    boxShadow: on
      ? 'inset 2px 2px 5px rgba(0,0,0,0.1), 2px 2px 8px rgba(80,190,140,0.3)'
      : 'inset 3px 3px 6px rgba(150,120,200,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)',
    cursor: 'pointer',
    border: 'none',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    flexShrink: 0,
  }),

  toggleKnob: (on) => ({
    position: 'absolute',
    top: 3,
    left: on ? 26 : 3,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'white',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.15)',
    transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
  }),

  saveBtn: {
    width: '100%',
    padding: '15px',
    border: 'none',
    borderRadius: 'var(--r-full)',
    background: 'linear-gradient(135deg, var(--lavender-dark) 0%, var(--peach-dark) 100%)',
    color: 'white',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '4px 4px 14px rgba(168,136,224,0.4), -2px -2px 10px rgba(255,255,255,0.6)',
    transition: 'all var(--t-fast)',
    letterSpacing: '0.02em',
    marginTop: 4,
  },

  warningBox: {
    background: 'var(--warning)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 14px',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#8a6a00',
    marginBottom: 12,
    textAlign: 'center',
    boxShadow: 'inset 2px 2px 5px rgba(255,200,50,0.25)',
    animation: 'slideDown 0.3s ease both',
  },

  completeBadge: {
    background: 'linear-gradient(135deg, var(--mint) 0%, #b0f0d8 100%)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 14px',
    fontSize: '0.9rem',
    fontWeight: 800,
    color: '#2d7a57',
    marginBottom: 12,
    textAlign: 'center',
    boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.6)',
  },
};

// ── Component ─────────────────────────────────────────
export default function DayModal({ dayNum, initialData, onSave, onClose }) {
  // ── Local state (copies of Firestore data) ──
  const [workout1, setWorkout1] = useState(initialData?.workout1 || []);
  const [workout2, setWorkout2] = useState(initialData?.workout2 || []);
  const [water,    setWater]    = useState(initialData?.water    || 0);
  const [diet,     setDiet]     = useState(initialData?.diet     || false);
  const [reading,  setReading]  = useState(initialData?.reading  || false);
  const [saving,   setSaving]   = useState(false);
  const [warn,     setWarn]     = useState('');

  // ── Derived: is this day fully complete? ──
  const isComplete = workout1.length > 0 && workout2.length > 0 && water >= 4 && diet && reading;

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Toggle workout selection (multi-select) ──
  const toggleWorkout = (list, setList, id) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── Save handler ──
  const handleSave = async () => {
    setWarn('');

    // Validation: both workouts required
    if (workout1.length === 0 || workout2.length === 0) {
      setWarn('Both workouts are required 💪');
      return;
    }

    setSaving(true);
    const dayData = {
      workout1,
      workout2,
      water,
      diet,
      reading,
      completed: isComplete,
    };
    await onSave(dayNum, dayData);
    setSaving(false);
    onClose();
  };

  return (
    <div style={S.overlay} onClick={handleBackdrop}>
      <div style={S.modal}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
              75 HARD
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Day {dayNum}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 2 }}>
              Log your tasks for today 🎯
            </p>
          </div>
          <button
            style={S.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            ✕
          </button>
        </div>

        {/* ── Completion banner ── */}
        {isComplete && (
          <div style={S.completeBadge}>
            🎉 Day {dayNum} fully complete! You're crushing it, Sameeraa!
          </div>
        )}

        {/* ── Warning ── */}
        {warn && <div style={S.warningBox}>{warn}</div>}

        {/* ── WORKOUT 1 ── */}
        <WorkoutSection
          title="Workout 1"
          emoji="🏋️"
          selected={workout1}
          onToggle={(id) => toggleWorkout(workout1, setWorkout1, id)}
        />

        {/* ── WORKOUT 2 ── */}
        <WorkoutSection
          title="Workout 2"
          emoji="⚡"
          selected={workout2}
          onToggle={(id) => toggleWorkout(workout2, setWorkout2, id)}
        />

        {/* ── WATER INTAKE ── */}
        <div style={S.section}>
          <div style={S.sectionTitle}>💧 Water Intake (Litres)</div>
          <div style={S.waterRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                onClick={() => setWater(water === n ? 0 : n)}
                style={{ ...S.bottle(water >= n), cursor: 'pointer' }}
                title={`${n}L`}
              >
                🍶
              </div>
            ))}
          </div>
          <div style={{
            textAlign: 'center',
            marginTop: 10,
            fontSize: '0.82rem',
            fontWeight: 700,
            color: water >= 4 ? '#2d7a57' : 'var(--text-secondary)',
          }}>
            {water === 0 ? 'Tap to select litres' : `${water}L of water${water < 4 ? ' — goal is 4L 💪' : ' — great! ✅'}`}
          </div>
        </div>

        {/* ── DIET ── */}
        <div style={S.section}>
          <div style={{ ...S.toggleRow }}>
            <span style={S.toggleLabel}>🥗 Followed your diet</span>
            <Toggle on={diet} onClick={() => setDiet(!diet)} />
          </div>
        </div>

        {/* ── READING ── */}
        <div style={S.section}>
          <div style={{ ...S.toggleRow }}>
            <span style={S.toggleLabel}>📖 Read 10 pages</span>
            <Toggle on={reading} onClick={() => setReading(!reading)} />
          </div>
        </div>

        {/* ── TASK CHECKLIST SUMMARY ── */}
        <TaskSummary workout1={workout1} workout2={workout2} water={water} diet={diet} reading={reading} />

        {/* ── SAVE BUTTON ── */}
        <button
          style={{
            ...S.saveBtn,
            opacity: saving ? 0.75 : 1,
          }}
          onClick={handleSave}
          disabled={saving}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          onMouseDown={(e)  => { e.currentTarget.style.transform = 'translateY(1px) scale(0.98)'; }}
          onMouseUp={(e)    => { e.currentTarget.style.transform = 'none'; }}
        >
          {saving ? '💾 Saving…' : isComplete ? '🎉 Save — Day Complete!' : '💾 Save Progress'}
        </button>

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────

/** Workout selector section */
function WorkoutSection({ title, emoji, selected, onToggle }) {
  return (
    <div style={{ ...S.section, marginBottom: 16 }}>
      <div style={S.sectionTitle}>
        <span>{emoji}</span> {title}
        {selected.length > 0 && (
          <span style={{
            marginLeft: 'auto',
            background: 'var(--mint)',
            color: '#2d7a57',
            borderRadius: 'var(--r-full)',
            padding: '1px 10px',
            fontSize: '0.7rem',
            fontWeight: 800,
          }}>
            ✓ Selected
          </span>
        )}
      </div>
      <div style={S.workoutGrid}>
        {WORKOUT_OPTIONS.map(({ id, label, emoji: icon }) => {
          const isSelected = selected.includes(id);
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              style={S.workoutChip(isSelected)}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={(e)  => { e.currentTarget.style.transform = 'scale(0.95)'; }}
              onMouseUp={(e)    => { e.currentTarget.style.transform = isSelected ? 'scale(1.04)' : 'scale(1)'; }}
            >
              <span style={{ fontSize: '1.4rem' }}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Clay toggle switch */
function Toggle({ on, onClick }) {
  return (
    <button
      style={S.toggle(on)}
      onClick={onClick}
      aria-checked={on}
      role="switch"
    >
      <div style={S.toggleKnob(on)} />
    </button>
  );
}

/** Mini task summary at bottom of modal */
function TaskSummary({ workout1, workout2, water, diet, reading }) {
  const tasks = [
    { label: 'Workout 1',  done: workout1.length > 0 },
    { label: 'Workout 2',  done: workout2.length > 0 },
    { label: 'Water (4L)', done: water >= 4 },
    { label: 'Diet',       done: diet },
    { label: 'Reading',    done: reading },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 14,
    }}>
      {tasks.map(({ label, done }) => (
        <div key={label} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 'var(--r-full)',
          background: done ? 'var(--mint)' : 'var(--cream-deep)',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: done ? '#2d7a57' : 'var(--text-muted)',
          boxShadow: done
            ? 'inset 2px 2px 4px rgba(255,255,255,0.6)'
            : 'inset 2px 2px 5px rgba(150,120,200,0.12)',
          transition: 'all 0.3s ease',
        }}>
          {done ? '✓' : '○'} {label}
        </div>
      ))}
    </div>
  );
}
