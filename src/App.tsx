import { useState } from 'react';
import type { Page } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FacialDetection from './pages/FacialDetection';
import PersonalityTest from './pages/PersonalityTest';
import DepressionDetection from './pages/DepressionDetection';
import GreenSpaces from './pages/GreenSpaces';
import StudentProgress from './pages/StudentProgress';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'facial': return <FacialDetection />;
      case 'personality': return <PersonalityTest />;
      case 'depression': return <DepressionDetection onNavigate={setCurrentPage} />;
      case 'greenspaces': return <GreenSpaces />;
      case 'student': return <StudentProgress />;
    }
  };

  return (
    <div className="font-sans antialiased">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>{renderPage()}</main>
    </div>
  );
}
