import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() { 
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handlesearch = async () => {
    if(!handle.trim()) {
      setError('Please enter a Codeforces handle');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim() })
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid handle or sync failed');
        setLoading(false);
        return;
      }
      
      // Navigate to ratings page after successful sync
      navigate(`/ratings/${handle.trim()}`);
    } catch (error) {
      console.error('Sync error:', error);
      setError('Error connecting to server. Make sure backend is running.');
      setLoading(false);
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.grid} />
      
      <div style={styles.container}>
        <h1 style={styles.title}>Codeforces Analyzer</h1>
        <p style={styles.subtitle}>Track and analyze your Codeforces performance</p>
        
        <div style={styles.searchBox}>
          <input  
            type="text" 
            placeholder="Enter CF handle to analyze" 
            value={handle} 
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handlesearch()}
            style={styles.input}
            disabled={loading}
          />
          <button 
            onClick={handlesearch}
            style={{...styles.button, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
            disabled={loading}
          >
            {loading ? 'Syncing...' : 'Analyze'}
          </button>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.info}>
          <p style={styles.infoText}>
            Example handles: <strong>tourist</strong>, <strong>Petr</strong>, <strong>Um_nik</strong>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
          background: #080c10; 
          overflow-x: hidden;
        }
        body {
          overflow-y: auto;
        }
        input::placeholder { color: #3a5a6a; }
        input:focus { outline: none; }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0,255,136,0.05);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0,255,136,0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0,255,136,0.4);
        }
      `}</style>
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#080c10',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Syne', sans-serif",
    position: 'relative',
    padding: '24px',
    overflowX: 'hidden',
    overflowY: 'auto',
    width: '100%',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  container: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    maxWidth: 600,
  },
  title: {
    fontSize: 56,
    fontWeight: 800,
    color: '#e8f0f8',
    marginBottom: 16,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#3a5a6a',
    fontSize: 18,
    marginBottom: 48,
    fontFamily: "'Space Mono', monospace",
  },
  searchBox: {
    display: 'flex',
    gap: 12,
    marginBottom: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  input: {
    padding: '14px 20px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e8f0f8',
    fontSize: 16,
    fontFamily: "'Space Mono', monospace",
    minWidth: 280,
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '14px 32px',
    background: '#00ff88',
    color: '#080c10',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 16,
    fontFamily: "'Space Mono', monospace",
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'opacity 0.2s',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 14,
    fontFamily: "'Space Mono', monospace",
    padding: '12px 16px',
    background: 'rgba(255,107,107,0.1)',
    borderRadius: 8,
    border: '1px solid rgba(255,107,107,0.2)',
    marginBottom: 24,
  },
  info: {
    marginTop: 48,
    padding: '20px 24px',
    background: 'rgba(0,255,136,0.04)',
    border: '1px solid rgba(0,255,136,0.15)',
    borderRadius: 12,
  },
  infoText: {
    color: '#3a5a6a',
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    lineHeight: 1.6,
  },
};

export default Home
