// =====================================================
// src/components/Dashboard.jsx
// Main dashboard — progress overview + 75-day grid
// =====================================================
import React, { useState, useEffect, useCallback } from 'react';
import { logout, fetchUserProgress, saveDayProgress, fetchUserDoc } from '../services/firebase';
import DayCard  from './DayCard';
import DayModal from './DayModal';
import NamePromptModal from './NamePromptModal';

// ── Motivational quotes ──────────────────────────────
const QUOTES = [
  "Keep going {name} 💪 — discipline beats motivation every time.",
  "You are building the best version of yourself, one day at a time 🌟",
  "Hard days build strong people. You've got this 🔥",
  "Every rep, every page, every drop of water — it all counts 💧",
  "The pain you feel today is the strength you'll have tomorrow ✨",
  "{name}, you're rewriting your story. One hard day at a time 📖",
];

// ── Styles ────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    padding: '0 0 60px',
    background: 'var(--cream)',
    backgroundImage:
      'radial-gradient(circle at 5% 10%, rgba(212,191,245,0.22) 0%, transparent 40%), ' +
      'radial-gradient(circle at 95% 90%, rgba(253,232,216,0.3) 0%, transparent 40%), ' +
      'radial-gradient(circle, rgba(168,136,224,0.06) 1px, transparent 1px)',
    backgroundSize: 'auto, auto, 28px 28px',
    animation: 'fadeIn 0.5s ease both',
  },

  // Sticky header
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(250,247,242,0.88)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(212,191,245,0.3)',
    padding: '16px 24px',
  },

  headerInner: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },

  streakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--peach)',
    borderRadius: 'var(--r-full)',
    padding: '6px 14px',
    boxShadow: 'var(--clay-raised)',
    fontSize: '0.82rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },

  logoutBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 'var(--r-full)',
    background: 'var(--rose)',
    color: '#c0395a',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: '0.82rem',
    cursor: 'pointer',
    boxShadow: '3px 3px 8px rgba(240,154,186,0.3), -2px -2px 6px rgba(255,255,255,0.8)',
    transition: 'all var(--t-fast)',
  },

  main: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '28px 20px 0',
  },

  // Hero card
  hero: {
    background: 'linear-gradient(135deg, var(--lavender) 0%, var(--peach) 60%, var(--blue-soft) 100%)',
    borderRadius: 'var(--r-xl)',
    padding: '32px 36px',
    marginBottom: 28,
    boxShadow: 'var(--clay-modal)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'fadeInUp 0.5s ease both',
  },

  heroBg: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    pointerEvents: 'none',
  },

  quote: {
    background: 'rgba(255,255,255,0.55)',
    borderRadius: 'var(--r-md)',
    padding: '12px 16px',
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontStyle: 'italic',
    marginTop: 16,
    boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.7)',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 14,
    marginBottom: 28,
    animation: 'fadeInUp 0.5s 0.1s ease both',
  },

  statCard: (color) => ({
    background: color,
    borderRadius: 'var(--r-lg)',
    padding: '16px 18px',
    boxShadow: 'var(--clay-card)',
    textAlign: 'center',
  }),

  gridLabel: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.3rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: 14,
    animation: 'fadeInUp 0.5s 0.15s ease both',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(74px, 1fr))',
    gap: 10,
    animation: 'fadeInUp 0.5s 0.2s ease both',
  },

  resetBtn: {
    display: 'block',
    margin: '32px auto 0',
    padding: '10px 24px',
    border: 'none',
    borderRadius: 'var(--r-full)',
    background: 'var(--cream-deep)',
    color: 'var(--text-muted)',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: '0.82rem',
    cursor: 'pointer',
    boxShadow: 'var(--clay-raised)',
    transition: 'all var(--t-fast)',
  },
};

// ── Component ─────────────────────────────────────────
export default function Dashboard({ user }) {
  const [progress,      setProgress]      = useState({});   // { day_1: {...}, ... }
  const [selectedDay,   setSelectedDay]   = useState(null); // day number or null
  const [loadingData,   setLoadingData]   = useState(true);
  const [userName,      setUserName]      = useState(true);
  const [quoteIdx,      setQuoteIdx]      = useState(0);
  const [toast,         setToast]         = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ── Cycle quote every 10s ──
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 10000);
    return () => clearInterval(t);
  }, []);

  // ── Load user data ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prog, userDoc] = await Promise.all([
          fetchUserProgress(user.uid),
          fetchUserDoc(user.uid),
        ]);
        setProgress(prog);
        if (userDoc?.name) setUserName(userDoc.name.split(' ')[0]); // first name
      } catch (err) {
        console.error('Failed to load data:', err);
        showToast('⚠️ Could not load data. Check connection.');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [user.uid]);

  // ── Compute stats ──
  const completedDays = Object.values(progress).filter((d) => d.completed).length;
  const totalProgress = Math.round((completedDays / 75) * 100);
  const currentStreak = computeStreak(progress);
  const today         = completedDays + 1; // next day to complete

  // ── Save day progress ──
  const handleSave = useCallback(async (dayNum, data) => {
    try {
      await saveDayProgress(user.uid, dayNum, data);
      setProgress((prev) => ({ ...prev, [`day_${dayNum}`]: data }));
      showToast(data.completed ? `🎉 Day ${dayNum} complete!` : `✅ Day ${dayNum} saved!`);
    } catch (err) {
      console.error('Save failed:', err);
      showToast('⚠️ Save failed. Please retry.');
    }
  }, [user.uid]);

  // ── Toast helper ──
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  // ── Logout ──
  const handleLogout = async () => {
    try { await logout(); }
    catch (err) { console.error(err); }
  };

  // ── Progress bar width ──
  const barWidth = `${totalProgress}%`;

  if (loadingData) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div className="loading-orb" />
          <p style={{ marginTop: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>
            Loading your journey…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>

      {/* ── Sticky Header ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🔥</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {userName}'s 75 Hard
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Stay consistent, build discipline
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Streak badge */}
            <div style={S.streakBadge}>
              🔥 {currentStreak} day streak
            </div>
            <button
              style={S.logoutBtn}
              onClick={handleLogout}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={S.main}>

        {/* ── Hero Card ── */}
        <div style={S.hero}>
          <div style={S.heroBg} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lavender-dark)', marginBottom: 4 }}>
              Your Journey
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.15 }}>
              {userName}'s<br />75 Hard Journey
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 18 }}>
              {completedDays} of 75 days complete · Day {Math.min(today, 75)} of 75
            </p>

            {/* Progress bar */}
            <div style={{
              background: 'rgba(255,255,255,0.55)',
              borderRadius: 'var(--r-full)',
              height: 14,
              boxShadow: 'inset 2px 2px 5px rgba(160,130,200,0.2)',
              overflow: 'hidden',
              marginBottom: 6,
            }}>
              <div style={{
                height: '100%',
                width: barWidth,
                background: 'linear-gradient(90deg, var(--lavender-dark) 0%, var(--peach-dark) 100%)',
                borderRadius: 'var(--r-full)',
                boxShadow: '2px 0 8px rgba(168,136,224,0.45)',
                transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                minWidth: completedDays > 0 ? '14px' : '0',
              }} />
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {totalProgress}% complete
            </div>

            {/* Rotating quote */}
            <div style={S.quote}>
              "{QUOTES[quoteIdx]}"
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={S.statsRow}>
          <StatCard value={completedDays}         label="Days Completed" emoji="✅" color="var(--mint)" />
          <StatCard value={75 - completedDays}    label="Days Remaining" emoji="🎯" color="var(--lavender)" />
          <StatCard value={`${currentStreak}`}    label="Current Streak" emoji="🔥" color="var(--peach)" />
          <StatCard value={`${totalProgress}%`}  label="Overall Progress" emoji="💪" color="var(--blue-soft)" />
        </div>

        {/* ── 75-Day Grid ── */}
        <div style={S.gridLabel}>Your 75-Day Grid</div>

        <div style={S.grid}>
          {Array.from({ length: 75 }, (_, i) => i + 1).map((day) => (
            <DayCard
              key={day}
              dayNum={day}
              data={progress[`day_${day}`]}
              today={today}
              onClick={(d) => setSelectedDay(d)}
            />
          ))}
        </div>

        {/* ── Reset Button ── */}
        {!showResetConfirm ? (
          <button
            style={S.resetBtn}
            onClick={() => setShowResetConfirm(true)}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#c0395a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            🔄 Reset Progress
          </button>
        ) : (
          <div style={{
            textAlign: 'center',
            marginTop: 28,
            background: 'var(--rose)',
            borderRadius: 'var(--r-lg)',
            padding: '20px',
            maxWidth: 360,
            margin: '32px auto 0',
            boxShadow: 'var(--clay-card)',
          }}>
            <p style={{ fontWeight: 700, color: '#c0395a', marginBottom: 14, fontSize: '0.92rem' }}>
              ⚠️ Are you sure? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                style={{ ...S.resetBtn, background: '#f09aba', color: 'white', margin: 0 }}
                onClick={() => {
                  setProgress({});
                  setShowResetConfirm(false);
                  showToast('Progress reset locally. Firestore data is preserved.');
                }}
              >
                Yes, Reset
              </button>
              <button
                style={{ ...S.resetBtn, margin: 0 }}
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── Day Modal ── */}
      {selectedDay && (
        <DayModal
          dayNum={selectedDay}
          initialData={progress[`day_${selectedDay}`]}
          onSave={handleSave}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {/* ── Toast Notification ── */}
      <div className={`toast ${toast ? 'visible' : ''}`}>{toast}</div>

      {/* ── Pulse ring animation ── */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────
function StatCard({ value, label, emoji, color }) {
  return (
    <div style={S.statCard(color)}>
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

// ── Streak computation ──────────────────────────────────
function computeStreak(progress) {
  let streak = 0;
  for (let i = 75; i >= 1; i--) {
    if (progress[`day_${i}`]?.completed) streak++;
    else if (streak > 0) break; // streak broken
  }
  return streak;
}
