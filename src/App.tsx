import { useEffect, useState } from 'react';
import type { Page } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FacialDetection from './pages/FacialDetection';
import PersonalityTest from './pages/PersonalityTest';
import DepressionDetection from './pages/DepressionDetection';
import GreenSpaces from './pages/GreenSpaces';
import StudentProgress from './pages/StudentProgress';
import SafeChat from './pages/SafeChat';
import Login from './pages/Login';
import { fetchCurrentUser, loginWithId, logoutSession } from './services/authApi';
import FloatingFloppyItems from './components/FloatingFloppyItems';
import { motion, AnimatePresence } from 'framer-motion';

const AUTH_TOKEN_KEY = 'mindspace.authToken';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const user = await fetchCurrentUser(token);
        setAuthToken(token);
        setCurrentUserId(user.userId);
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setAuthLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const handleLogin = async ({ userId, password }: { userId: string; password: string }) => {
    setAuthError(null);
    setLoginSubmitting(true);
    try {
      const response = await loginWithId(userId, password);
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      setAuthToken(response.token);
      setCurrentUserId(response.user.userId);
      setCurrentPage('home');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed.');
      throw error;
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await logoutSession(authToken);
      } catch {
        // Ignore backend logout failure and always clear local session.
      }
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setCurrentUserId(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'facial': return <FacialDetection />;
      case 'personality': return <PersonalityTest />;
      case 'depression': return <DepressionDetection onNavigate={setCurrentPage} />;
      case 'greenspaces': return <GreenSpaces />;
      case 'student': return <StudentProgress />;
      case 'chatbot': return <SafeChat />;
    }
  };

  if (authLoading) {
    return (
      <div className="font-sans antialiased relative overflow-x-hidden min-h-screen">
        <FloatingFloppyItems />
        <div className="page-shell flex items-center justify-center text-slate-600">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-2xl px-8 py-5 text-sm font-bold shadow-xl shadow-purple-500/20 text-purple-700"
          >
            Checking secure session...
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authToken || !currentUserId) {
    return (
      <div className="font-sans antialiased relative overflow-x-hidden min-h-screen">
        <FloatingFloppyItems />
        <Login onLogin={handleLogin} loading={loginSubmitting} error={authError} />
      </div>
    );
  }

  return (
    <div className="font-sans antialiased relative overflow-x-hidden min-h-screen">
      <FloatingFloppyItems />
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} userId={currentUserId} onLogout={handleLogout} />
      <main className="pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="min-h-screen"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
