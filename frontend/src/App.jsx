import React, { useState, useEffect, useRef } from 'react';

function App() {
  // --- MAIN STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('home'); 
  
  // --- AUTH STATE ---
  const [isRegistering, setIsRegistering] = useState(false); // NEW: Toggles Login/Register
  const [name, setName] = useState(''); // NEW: For registration
  const [vehicle, setVehicle] = useState(''); // NEW: For registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState(''); // Shows errors OR success

  // --- GPS & CHAT STATE ---
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('System Ready: Click to locate');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Awaiting breakdown details. Describe the mechanical failure.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- THEME ---
  const theme = {
    text: '#ffffff',
    accent: '#e63946', 
    success: '#39ff14',
    panelBg: 'rgba(15, 15, 15, 0.75)',
    cardBg: 'rgba(25, 25, 25, 0.6)',
    cardHover: 'rgba(40, 40, 40, 0.8)'
  };
  const bgImage = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop';

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i} style={{ display: 'block', marginBottom: '8px' }}>
        {line.split('**').map((part, j) => 
          j % 2 === 1 ? <strong key={j} style={{ color: '#fff', letterSpacing: '1px' }}>{part}</strong> : part
        )}
      </span>
    ));
  };

  // --- AUTHENTICATION FUNCTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMessage('Processing...'); 
    
    // Decide which doorway to use based on the toggle switch
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const payload = isRegistering 
      ? { name, email, password, vehicle } 
      : { email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (isRegistering) {
          setAuthMessage('✅ Registration successful! Please Sign In.');
          setIsRegistering(false); // Flip back to login screen
        } else {
          setIsLoggedIn(true); // Unlock dashboard!
        }
      } else {
        setAuthMessage(`❌ ${data.error}`); 
      }
    } catch (error) {
      setAuthMessage('❌ Cannot connect to server. Is backend running?');
    }
  };

  const handleEmergency = () => {
    setStatus('Scanning for GPS Coordinates...');
    if (!navigator.geolocation) {
      setStatus('GPS Error: Not supported by browser');
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStatus('Target Acquired!');
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => setStatus('Connection Failed. Did you allow GPS access?'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newUserMsg = { role: 'user', text: inputMessage };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newUserMsg.text })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', text: `SYSTEM ERROR: ${data.error}` }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'SYSTEM OFFLINE: Cannot reach backend.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- UI RENDERERS ---
  const renderLogin = () => (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: theme.panelBg, padding: '50px', borderRadius: '15px', width: '400px', textAlign: 'center', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>MotoTribe</h1>
        <p style={{ color: '#a0a0a0', marginBottom: '20px', fontSize: '1.1rem' }}>
          {isRegistering ? 'Create Your Account' : 'Premium Rescue & Maintenance'}
        </p>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Error/Success Message Display */}
          {authMessage && (
            <div style={{ color: authMessage.includes('✅') ? theme.success : theme.accent, fontSize: '0.9rem', fontWeight: 'bold' }}>
              {authMessage}
            </div>
          )}
          
          {isRegistering && (
            <>
              <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              <input type="text" placeholder="Vehicle (e.g. Apache RR310)" required value={vehicle} onChange={(e) => setVehicle(e.target.value)} style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
            </>
          )}
          
          <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
          
          <button type="submit" style={{ backgroundColor: theme.accent, color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px', transition: 'background 0.3s' }}>
            {isRegistering ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#ccc', fontSize: '0.9rem' }}>
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <span 
            onClick={() => { setIsRegistering(!isRegistering); setAuthMessage(''); }} 
            style={{ color: theme.accent, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Sign In' : 'Sign Up'}
          </span>
        </p>

        {!isRegistering && (
          <>
            <div style={{ margin: '20px 0', color: '#888' }}>— OR —</div>
            <button style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1rem', transition: 'opacity 0.3s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }}/>
              Sign in with Google
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderHome = () => (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>MotoTribe</h1>
        <button onClick={() => setIsLoggedIn(false)} style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Logout</button>
      </header>

      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '4.5rem', margin: '0 0 20px 0', lineHeight: '1.1', textTransform: 'uppercase', fontWeight: '700' }}>Expert Vehicle<br/>Assistance.</h2>
        <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '500px', lineHeight: '1.6' }}>Fast, reliable, and intelligent roadside support when you need it most. Select a service below to deploy assistance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* Card 1: AI Chat */}
        <div onClick={() => setCurrentView('chat')} style={{ backgroundColor: theme.cardBg, padding: '40px', borderRadius: '15px', cursor: 'pointer', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s, background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.cardHover} onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}>
          <h3 style={{ fontSize: '1.8rem', margin: '0 0 15px 0', color: theme.accent }}>AI Diagnostic Chat</h3>
          <p style={{ color: '#aaa', lineHeight: '1.5', marginBottom: '30px' }}>Interact with our advanced AI mechanic to troubleshoot engine failures instantly.</p>
          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Initiate →</div>
        </div>

        {/* Card 2: GPS Locator */}
        <div onClick={() => setCurrentView('map')} style={{ backgroundColor: theme.cardBg, padding: '40px', borderRadius: '15px', cursor: 'pointer', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s, background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.cardHover} onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}>
          <h3 style={{ fontSize: '1.8rem', margin: '0 0 15px 0', color: theme.accent }}>Garage Locator</h3>
          <p style={{ color: '#aaa', lineHeight: '1.5', marginBottom: '30px' }}>Ping your exact GPS coordinates to find the nearest certified repair shops.</p>
          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Locate →</div>
        </div>

        {/* Card 3: The Restored Future Expansion Section */}
        <div style={{ backgroundColor: 'rgba(25, 25, 25, 0.3)', padding: '40px', borderRadius: '15px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px dashed rgba(255,255,255,0.2)' }}>
          <h3 style={{ fontSize: '1.8rem', margin: '0 0 15px 0', color: '#888' }}>Maintenance Hub</h3>
          <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '30px' }}>Future expansion: Log your vehicle history and schedule routine maintenance.</p>
          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', color: '#555' }}>Coming Soon</div>
        </div>

      </div>
    </div>
  );
  
  const renderChat = () => (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Diagnostic Interface</h2>
        <button onClick={() => setCurrentView('home')} style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>← Return Home</button>
      </header>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? theme.accent : 'rgba(30,30,30,0.85)', padding: '20px', borderRadius: '12px', width: '80%', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{msg.role === 'user' ? 'You' : 'System AI'}</div>
            <div style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>{formatMessage(msg.text)}</div>
          </div>
        ))}
        {isTyping && <div style={{ opacity: 0.7, fontStyle: 'italic', padding: '10px' }}>Analyzing...</div>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '15px', paddingTop: '20px' }}>
        <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Describe the issue..." style={{ flexGrow: 1, padding: '18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '1.05rem', outline: 'none' }} />
        <button type="submit" disabled={isTyping} style={{ backgroundColor: theme.accent, color: '#fff', border: 'none', padding: '0 30px', borderRadius: '8px', cursor: isTyping ? 'not-allowed' : 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>Send</button>
      </form>
    </div>
  );

  const renderMap = () => (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Emergency Locator</h2>
        <button onClick={() => setCurrentView('home')} style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>← Return Home</button>
      </header>
      <div style={{ textAlign: 'center', padding: '30px 0' }}>
        <button onClick={handleEmergency} style={{ backgroundColor: theme.accent, color: '#fff', border: 'none', padding: '15px 30px', fontSize: '1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}>Initiate GPS Tracking</button>
        <p style={{ marginTop: '15px', color: '#ccc', fontWeight: 'bold' }}>{status}</p>
      </div>
      <div style={{ flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {location ? (
          <iframe title="Google Map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`}></iframe>
        ) : (
          <p style={{ opacity: 0.5, textTransform: 'uppercase', fontWeight: 'bold' }}>Radar Offline</p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      color: theme.text, 
      fontFamily: '"Montserrat", "Inter", sans-serif',
      backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 0.85)), url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
      `}</style>
      
      {!isLoggedIn ? renderLogin() : currentView === 'home' ? renderHome() : currentView === 'chat' ? renderChat() : renderMap()}
    </div>
  );
}

export default App;