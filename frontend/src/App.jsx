import React, { useState, useEffect, useRef } from 'react';

function App() {
  // --- MAIN STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('home'); 
  
  // --- AUTH STATE ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // --- GPS & CHAT STATE ---
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('System Ready: Click to locate');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'How can I help you with your vehicle today? Describe the symptom, and get an instant professional-grade diagnosis.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- HELPER FUNCTIONS ---
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i} style={{ display: 'block', marginBottom: '8px' }}>
        {line.split('**').map((part, j) => 
          j % 2 === 1 ? <strong key={j} className="text-white tracking-wide">{part}</strong> : part
        )}
      </span>
    ));
  };

  // --- AUTHENTICATION FUNCTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMessage('Processing...'); 
    
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
          setIsRegistering(false);
        } else {
          setIsLoggedIn(true);
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
          setCurrentView('map');
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

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-black text-white antialiased font-sans relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: "url('/bg-pattern.png')", backgroundRepeat: 'repeat', backgroundSize: '300px' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#137fec]/20 rounded-full blur-[120px] animate-pulse-glow z-0"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md" style={{ background: 'rgba(25, 25, 25, 0.6)' }}>
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#137fec] rounded-custom flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tighter">MOTOTRIBE</h1>
        <p className="text-gray-400 text-center mb-8">
          {isRegistering ? 'Create Your Account' : 'Premium Rescue & Maintenance'}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {authMessage && (
            <div className={`text-sm font-bold ${authMessage.includes('✅') ? 'text-[#39ff14]' : 'text-red-500'}`}>
              {authMessage}
            </div>
          )}
          
          {isRegistering && (
            <>
              <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-surface-900 border border-white/10 rounded-custom px-4 py-3 text-sm focus:ring-[#137fec] focus:border-[#137fec] outline-none transition-all bg-black/40" />
              <input type="text" placeholder="Vehicle (e.g. Apache RR310)" required value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full bg-surface-900 border border-white/10 rounded-custom px-4 py-3 text-sm focus:ring-[#137fec] focus:border-[#137fec] outline-none transition-all bg-black/40" />
            </>
          )}
          
          <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-900 border border-white/10 rounded-custom px-4 py-3 text-sm focus:ring-[#137fec] focus:border-[#137fec] outline-none transition-all bg-black/40" />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-900 border border-white/10 rounded-custom px-4 py-3 text-sm focus:ring-[#137fec] focus:border-[#137fec] outline-none transition-all bg-black/40" />
          
          <button type="submit" className="w-full px-6 py-3 bg-[#137fec] hover:bg-[#0a4da0] text-white text-sm font-semibold rounded-custom transition-all duration-300 shadow-[0_0_20px_rgba(19,127,236,0.3)] uppercase tracking-widest mt-4">
            {isRegistering ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => { setIsRegistering(!isRegistering); setAuthMessage(''); }} className="text-[#137fec] cursor-pointer font-bold hover:underline">
            {isRegistering ? 'Sign In' : 'Sign Up'}
          </span>
        </p>

        {!isRegistering && (
          <>
            <div className="my-6 flex items-center before:flex-1 before:border-t before:border-white/10 after:flex-1 after:border-t after:border-white/10">
              <span className="px-3 text-gray-500 text-sm">OR</span>
            </div>
            <button className="w-full bg-white text-black border-none px-4 py-3 rounded-custom cursor-pointer font-bold flex justify-center items-center gap-3 text-sm transition-opacity hover:opacity-80">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5" />
              Sign in with Google
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="bg-black text-white antialiased font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a className="flex items-center space-x-2" href="#" onClick={() => setCurrentView('home')}>
              <div className="w-8 h-8 bg-[#137fec] rounded-custom flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span className="text-xl font-bold tracking-tighter">MOTOTRIBE</span>
            </a>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
              <button onClick={() => setCurrentView('chat')} className="hover:text-[#137fec] transition-colors">AI Mechanic</button>
              <button onClick={() => setCurrentView('map')} className="hover:text-[#137fec] transition-colors">Garage Locator</button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsLoggedIn(false)} className="px-6 py-2.5 bg-transparent border border-white/20 hover:bg-white/10 text-white text-sm font-semibold rounded-custom transition-all duration-300">
              Disconnect
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Conditional View Rendering */}
        {currentView === 'home' && (
          <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: "url('/bg-pattern.png')", backgroundRepeat: 'repeat', backgroundSize: '300px' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#137fec]/20 rounded-full blur-[120px] animate-pulse-glow z-0"></div>
            </div>
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#137fec]/30 bg-[#137fec]/5 text-[#137fec] text-xs font-semibold tracking-widest uppercase mb-8">
                Next Gen Vehicle Support
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #999999 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Your AI Mechanic <br/>is Always On.
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Diagnose vehicle issues in seconds with our advanced AI chatbot and find the nearest expert garages with real-time availability.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => setCurrentView('chat')} className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-custom hover:bg-gray-200 transition-all">
                  Start Diagnostic
                </button>
                <button onClick={handleEmergency} className="w-full sm:w-auto px-8 py-4 bg-[#121212] border border-white/10 text-white font-bold rounded-custom hover:bg-[#1a1a1a] transition-all">
                  Locate Garage
                </button>
              </div>
            </div>
          </section>
        )}

        {currentView === 'chat' && (
          <section className="py-32 relative min-h-screen overflow-hidden">
            {/* NEW: Background Pattern added to Chat */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: "url('/bg-pattern.png')", backgroundRepeat: 'repeat', backgroundSize: '300px' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-6">Expert diagnostics, <br/><span className="text-[#137fec]">without the wait.</span></h2>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    Our AI is trained on millions of repair logs and technical manuals. Describe the symptom, and get an instant professional-grade diagnosis for your vehicle.
                  </p>
                </div>
                
                <div className="rounded-2xl p-6 min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden" style={{ background: 'rgba(25, 25, 25, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#137fec]/20 rounded-full blur-3xl"></div>
                  
                  {/* Dynamic Chat History */}
                  <div className="flex-1 space-y-6 overflow-y-auto mb-6 pr-2">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : ''} space-x-4`}>
                        {msg.role === 'ai' && (
                          <div className="w-10 h-10 rounded-full bg-[#137fec] flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          </div>
                        )}
                        <div className={`${msg.role === 'user' ? 'bg-[#137fec]/20 border border-[#137fec]/30 text-[#137fec]' : 'bg-[#121212]/80 border border-white/5'} p-4 rounded-custom max-w-[80%] backdrop-blur-md`}>
                          <p className="text-sm leading-relaxed">{formatMessage(msg.text)}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-[#137fec] flex items-center justify-center shrink-0">
                           <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </div>
                        <div className="bg-[#121212]/80 p-4 rounded-custom border border-white/5 max-w-[80%] backdrop-blur-md">
                          <p className="text-sm italic">Analyzing diagnostics...</p>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="relative z-10">
                    <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-custom px-6 py-4 text-sm focus:ring-[#137fec] focus:border-[#137fec] outline-none transition-all backdrop-blur-md text-white" placeholder="Describe your vehicle issue..." type="text" />
                    <button type="submit" disabled={isTyping} className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#137fec] p-2 rounded-custom hover:bg-[#0a4da0] transition-colors disabled:opacity-50">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

        {currentView === 'map' && (
          <section className="py-32 relative min-h-screen overflow-hidden">
            {/* NEW: Background Pattern added to Map */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <div className="absolute inset-0 opacity-20 z-0" style={{ backgroundImage: "url('/bg-pattern.png')", backgroundRepeat: 'repeat', backgroundSize: '300px' }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold mb-4">Emergency Locator Radar</h2>
                <p className="text-[#137fec] font-bold mb-6">{status}</p>
                <button onClick={handleEmergency} className="px-8 py-3 bg-[#137fec] hover:bg-[#0a4da0] text-white font-semibold rounded-custom transition-all shadow-[0_0_20px_rgba(19,127,236,0.3)]">
                  Ping Coordinates
                </button>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden border border-white/10 h-[600px] flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-md shadow-2xl">
                {location ? (
                  <iframe title="Google Map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`}></iframe>
                ) : (
                  <p className="opacity-50 tracking-widest uppercase font-semibold">Radar Offline. Initiate Ping.</p>
                )}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>© 2026 MotoTribe Technologies Inc. All rights reserved. | Developed by bhavishk01</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a className="hover:text-white transition-colors" href="https://github.com/bhavishk01">GitHub Profile</a>
              <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      {!isLoggedIn ? renderLogin() : renderDashboard()}
    </>
  );
}

export default App;