import React, { useState } from 'react';
import HomePage from './components/HomePage';
// import PatternOrderPage from './components/PatternOrderPage';
import ReviewImagesPage from './components/ReviewImagesPage';
import DefectAnalysisPage from './components/DefectAnalysisPage';
import ImageCaptureProcess from './components/ImageCaptureProcess';

declare global {
  interface Window {
    electronAPI?: {
      saveTestImages: (images: string[]) => void;
      onTestImagesSaved: (callback: () => void) => void;
      enableFullScreen: () => void;
      disableFullScreen: () => void;
    };
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [ppid, setPpid] = useState<string>('');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  // Start the defect checker routine
  const startDefectChecker = (enteredPpid: string) => {
    setPpid(enteredPpid);
    setIsCapturing(true);
  };

  // Handle when image capture is complete
  const handleCaptureComplete = (images: string[]) => {
    window.electronAPI.disableFullScreen();
    setCapturedImages(images);
    setIsCapturing(false);
    setCurrentPage('review');
  };

  // Approve images and go to defect analysis
  const approveImages = () => {
    setCurrentPage('defect-analysis');
  };

  // Retake images
  const retakeImages = () => {
    setIsCapturing(true);
  };

  // Submit defect analysis and go back to home page
  const submitDefectAnalysis = () => {
    setPpid('');
    setCapturedImages([]);
    setCurrentPage('home');
  };

  // Discard session
  const discardSession = () => {
    setPpid('');
    setCapturedImages([]);
    setCurrentPage('home');
  };

  // Determine which page to render
  if (isCapturing) {
    window.electronAPI.enableFullScreen();
    return (
      <ImageCaptureProcess onComplete={handleCaptureComplete} ppid={ppid} />
    );
  }

  switch (currentPage) {
    case 'home':
      return <HomePage onStartDefectChecker={startDefectChecker} />;
    // case 'pattern-order':
    //   return <PatternOrderPage ppid={ppid} onDiscard={discardSession} />;
    case 'review':
      return (
        <ReviewImagesPage
          ppid={ppid}
          capturedImages={capturedImages}
          onApprove={approveImages}
          onRetake={retakeImages}
          onDiscard={discardSession}
        />
      );
    case 'defect-analysis':
      return (
        <DefectAnalysisPage
          ppid={ppid}
          onSubmit={submitDefectAnalysis}
          onDiscard={discardSession}
        />
      );
    default:
      return <HomePage onStartDefectChecker={startDefectChecker} />;
  }
}

export default App;
