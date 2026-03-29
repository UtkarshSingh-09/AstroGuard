import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

const Starfield = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 100, // random start horizontal %
      y: Math.random() * 100, // random start vertical %
      size: Math.random() * 2 + 1, // 1px to 3px
      duration: Math.random() * 20 + 10, // 10s to 30s
      delay: Math.random() * -30, // Random delay so they don't sync
      targetX: Math.random() * 100,
      targetY: Math.random() * 100,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#45A29E]/40"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          animate={{
            x: [0, (star.targetX - star.x) * (typeof window !== 'undefined' ? window.innerWidth / 100 : 10), 0],
            y: [0, (star.targetY - star.y) * (typeof window !== 'undefined' ? window.innerHeight / 100 : 10), 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
            delay: star.delay
          }}
        />
      ))}
    </div>
  );
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    setError('');
  }, [isLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = localStorage.getItem('astra_user');
      if (user) {
        navigate('/');
      } else {
        setError('Terminal access denied. Invalid credentials.');
      }
    } else {
      if (!name || !email || !password) {
        setError('All fields are required to initialize DNA profile.');
        return;
      }
      localStorage.setItem('astra_user', JSON.stringify({ email, name }));
      navigate('/onboard');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B0C10] flex items-center justify-center overflow-hidden p-6 font-sans">
      <Starfield />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-12 rounded-3xl bg-[#1F2833]/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-[#45A29E]/10 border border-[#45A29E]/20 rounded-2xl mb-4 backdrop-blur-md">
            <Shield className="w-8 h-8 text-[#45A29E]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">AstraGuard Terminal</h1>
          <p className="text-[#94A3B8] text-sm mt-2 text-center">
            {isLogin ? 'Authenticate to access secure databanks.' : 'Establish a new secure identity profile.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col w-full mt-8 mb-4 space-y-4">
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 h-14 text-white text-base placeholder:text-[#94A3B8] focus:ring-1 focus:ring-[#45A29E] focus:border-transparent outline-none transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 h-14 text-white text-base placeholder:text-[#94A3B8] focus:ring-1 focus:ring-[#45A29E] focus:border-transparent outline-none transition-all"
          />

          <input
            type="password"
            placeholder="Passphrase"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 h-14 text-white text-base placeholder:text-[#94A3B8] focus:ring-1 focus:ring-[#45A29E] focus:border-transparent outline-none transition-all"
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-sm mt-2 font-medium bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full mt-2 h-14 bg-[#45A29E] text-black font-bold rounded-xl hover:bg-white transition-colors text-base shadow-[0_0_15px_rgba(69,162,158,0.2)]"
          >
            {isLogin ? 'Initialize Session' : 'Create DNA Profile'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-[#94A3B8] text-sm hover:text-[#45A29E] transition-colors outline-none"
          >
            {isLogin ? "Don't have an account? Create one." : "Already have an identity? Login here."}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
