// =====================================================
// src/App.jsx  —  Root of the application
// Handles auth state and routes between Login/Dashboard
// =====================================================
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, createUserDoc } from './services/firebase';
import Login     from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase persists auth across reloads — subscribe to changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ensure user doc exists (handles Google sign-in first time)
        await createUserDoc(currentUser).catch(console.error);
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, []);

  // ── Loading splash ────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div className="loading-orb" />
          <p style={{
            marginTop: 16,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
          }}>
            Loading your journey…
          </p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard user={user} /> : <Login />;
}
