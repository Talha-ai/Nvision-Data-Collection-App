import { useState } from 'react';
import HomePage from './components/HomePage';
import TestingPage from './components/TestingPage';
import DefectAnalysisPage from './components/DefectAnalysisPage';
import ImageCaptureProcess from './components/ImageCaptureProcess';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [displayId, setDisplayId] = useState('#456898');
  const [isCapturing, setIsCapturing] = useState(false);

  // Function to generate a random display ID
  const generateDisplayId = () => {
    const randomId = Math.floor(100000 + Math.random() * 900000);
    return `#${randomId}`;
  };

  // Start a new testing session
  const startNewSession = () => {
    setDisplayId(generateDisplayId());
    setCurrentPage('testing');
  };

  // Run the defect checker routine
  const runDefectChecker = () => {
    setIsCapturing(true);
  };

  // When image capture is complete
  const handleCaptureComplete = () => {
    setIsCapturing(false);
    setCurrentPage('defect-analysis');
  };

  // Submit defect analysis and go back to home page
  const submitDefectAnalysis = () => {
    setSelectedPatterns([]);
    setCurrentPage('home');
  };

  // Determine which page to render
  if (isCapturing) {
    return (
      <ImageCaptureProcess
        patterns={selectedPatterns}
        onComplete={handleCaptureComplete}
      />
    );
  }

  switch (currentPage) {
    case 'home':
      return <HomePage onStartNewSession={startNewSession} />;
    case 'testing':
      return (
        <TestingPage
          displayId={displayId}
          selectedPatterns={selectedPatterns}
          setSelectedPatterns={setSelectedPatterns}
          onRunDefectChecker={runDefectChecker}
        />
      );
    case 'defect-analysis':
      return (
        <DefectAnalysisPage
          displayId={displayId}
          onSubmit={submitDefectAnalysis}
        />
      );
    default:
      return <HomePage onStartNewSession={startNewSession} />;
  }
}

export default App;
