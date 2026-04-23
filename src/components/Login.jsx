// =====================================================
// src/components/Login.jsx
// Beautiful claymorphic login / sign-up page
// =====================================================
import React, { useState } from 'react';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
} from '../services/firebase';

// ── Inline styles (self-contained, no CSS file dependency) ──
const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--cream)',
    backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(212,191,245,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(253,232,216,0.4) 0%, transparent 50%), radial-gradient(circle, rgba(168,136,224,0.06) 1px, transparent 1px)',
    backgroundSize: 'auto, auto, 28px 28px',
    animation: 'fadeIn 0.6s ease both',
  },

  card: {
    width: '100%',
    maxWidth: 440,
    background: 'rgba(250, 247, 242, 0.92)',
    backdropFilter: 'blur(24px)',
    borderRadius: 'var(--r-xl)',
    padding: '44px 40px 40px',
    boxShadow: 'var(--clay-modal)',
    animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
  },

  emoji: {
    fontSize: 48,
    display: 'block',
    marginBottom: 10,
    filter: 'drop-shadow(2px 4px 6px rgba(168,136,224,0.4))',
  },

  heading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
    marginBottom: 4,
  },

  subheading: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    marginBottom: 28,
  },

  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    background: 'var(--lavender)',
    borderRadius: 'var(--r-full)',
    padding: 4,
    boxShadow: 'var(--clay-pressed)',
  },

  tab: (active) => ({
    flex: 1,
    padding: '9px 0',
    border: 'none',
    borderRadius: 'var(--r-full)',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    background: active ? 'var(--cream)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    boxShadow: active ? 'var(--clay-raised)' : 'none',
  }),

  label: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: 6,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderRadius: 'var(--r-md)',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    fontSize: '0.95rem',
    background: 'var(--lavender)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--clay-pressed)',
    outline: 'none',
    marginBottom: 14,
    transition: 'box-shadow 0.2s ease',
  },

  primaryBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: 'var(--r-full)',
    background: 'linear-gradient(135deg, var(--lavender-dark) 0%, var(--peach-dark) 100%)',
    color: 'white',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '4px 4px 12px rgba(168,136,224,0.4), -2px -2px 8px rgba(255,255,255,0.6)',
    transition: 'all var(--t-fast)',
    marginTop: 6,
    letterSpacing: '0.02em',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '20px 0',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontWeight: 600,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, transparent, var(--lavender-mid), transparent)',
  },

  googleBtn: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: 'var(--r-full)',
    background: 'var(--cream)',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: '0.92rem',
    cursor: 'pointer',
    boxShadow: 'var(--clay-raised)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'all var(--t-fast)',
  },

  errorBox: {
    background: 'var(--rose)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 14px',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#c0395a',
    marginBottom: 12,
    boxShadow: 'inset 2px 2px 6px rgba(240,154,186,0.3)',
    animation: 'slideDown 0.3s ease both',
  },

  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
};

// ── Google SVG icon ──
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

// ── Component ──────────────────────────────────────────────
export default function Login() {
  const [mode,     setMode]    = useState('login'); // 'login' | 'signup'
  const [name,     setName]    = useState('');
  const [email,    setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]   = useState('');
  const [loading,  setLoading]  = useState(false);

  const clearError = () => setError('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your name 🌸'); setLoading(false); return; }
        await registerWithEmail(name.trim(), email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      // Map Firebase error codes to friendly messages
      const msgs = {
        'auth/email-already-in-use':  'That email is already registered. Try logging in!',
        'auth/user-not-found':        'No account found with that email.',
        'auth/wrong-password':        'Wrong password — give it another shot! 💪',
        'auth/invalid-email':         'Please enter a valid email address.',
        'auth/weak-password':         'Password should be at least 6 characters.',
        'auth/invalid-credential':    'Invalid credentials. Check your email and password.',
        'auth/too-many-requests':     'Too many attempts. Please wait a moment.',
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <span style={S.emoji}>🔥</span>
        <h1 style={S.heading}>75 Hard<br />Challenge</h1>
        <p style={S.subheading}>
          {mode === 'login' ? 'Welcome back, champion 💜' : "Let's start your journey!"}
        </p>

        {/* Login / Signup Tabs */}
        <div style={S.tabRow}>
          <button style={S.tab(mode === 'login')}  onClick={() => { setMode('login');  clearError(); }}>Login</button>
          <button style={S.tab(mode === 'signup')} onClick={() => { setMode('signup'); clearError(); }}>Sign Up</button>
        </div>

        {/* Error Message */}
        {error && <div style={S.errorBox}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleEmailAuth} autoComplete="off">
          {mode === 'signup' && (
            <>
              <label style={S.label}>Your Name</label>
              <input
                style={S.input}
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </>
          )}

          <label style={S.label}>Email</label>
          <input
            style={S.input}
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
          />

          <label style={S.label}>Password</label>
          <input
            style={S.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            style={{
              ...S.primaryBtn,
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'scale(0.98)' : 'scale(1)',
            }}
            disabled={loading}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px) scale(1.01)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
            onMouseDown={(e)  => { e.target.style.boxShadow = 'inset 3px 3px 8px rgba(168,136,224,0.5)'; }}
            onMouseUp={(e)    => { e.target.style.boxShadow = '4px 4px 12px rgba(168,136,224,0.4), -2px -2px 8px rgba(255,255,255,0.6)'; }}
          >
            {loading ? '⏳ Please wait…' : mode === 'login' ? '✨ Login' : '🚀 Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={S.divider}>
          <div style={S.dividerLine} />
          <span>or</span>
          <div style={S.dividerLine} />
        </div>

        {/* Google Sign-In */}
        <button
          style={S.googleBtn}
          onClick={handleGoogle}
          disabled={loading}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--clay-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--clay-raised)'; e.currentTarget.style.transform = 'none'; }}
          onMouseDown={(e)  => { e.currentTarget.style.boxShadow = 'var(--clay-pressed)'; e.currentTarget.style.transform = 'translateY(1px)'; }}
          onMouseUp={(e)    => { e.currentTarget.style.boxShadow = 'var(--clay-raised)'; e.currentTarget.style.transform = 'none'; }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p style={S.footer}>
          By continuing, you're committing to 75 days of hard work 💪
        </p>
      </div>
    </div>
  );
}
