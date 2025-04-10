import React, { useState } from 'react';
import HomePage from './components/HomePage';
import ReviewImagesPage from './components/ReviewImagesPage';
import DefectAnalysisPage from './components/DefectAnalysisPage';
import ImageCaptureProcess from './components/ImageCaptureProcess';
import CustomTitlebar from './components/customTitlebar';

declare global {
  interface Window {
    electronAPI?: {
      saveTestImages: (images: string[]) => void;
      onTestImagesSaved: (callback: () => void) => void;
      enableFullScreen: () => void;
      disableFullScreen: () => void;
      getAssetPath: (assetName: string) => string;
      loadImageAsDataURL: (imageName: string) => string;
      convertToBMP: (pngDataUrl: string) => string;
      minimizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [ppid, setPpid] = useState<string>('');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  // Start the defect checker routine
  const startDefectChecker = (enteredPpid: string) => {
    setPpid(enteredPpid);
    setIsCapturing(true);
  };

  // Handle when image capture is complete
  const handleCaptureComplete = (images: string[]) => {
    console.log(images);
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

  return (
    <div className="app-container">
      {/* Only render the titlebar when not in capture mode */}
      <CustomTitlebar onMinimize={handleMinimize} onClose={handleClose} />

      <div className="content-area">
        {(() => {
          switch (currentPage) {
            case 'home':
              return <HomePage onStartDefectChecker={startDefectChecker} />;
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
        })()}
      </div>

      <style jsx>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        .content-area {
          flex-grow: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}

export default App;
