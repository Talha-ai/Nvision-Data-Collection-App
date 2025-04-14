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

      getAssetPath: (assetName: string) => string;
      loadImageAsDataURL: (imageName: string) => string;
      uploadImage: (data: {
        imageData: string;
        ppid: string;
        patternName: string;
        isTestMode: boolean;
      }) => Promise<string>;

      enableFullScreen: () => void;
      disableFullScreen: () => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [ppid, setPpid] = useState<string>('');
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<(string | null)[]>(
    []
  );

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  // Start the defect checker routine
  const startDefectChecker = (enteredPpid: string, mode: boolean) => {
    setPpid(enteredPpid);
    setIsTestMode(mode);
    setIsCapturing(true);
  };

  // Handle when image capture is complete
  const handleCaptureComplete = (
    uploadedUrls: (string | null)[]
  ) => {
    window.electronAPI.disableFullScreen();
    setUploadedImageUrls(uploadedUrls);
    setIsCapturing(false);
    setCurrentPage('review');
  };

  console.log(uploadedImageUrls);

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
    setUploadedImageUrls([]);
    setCurrentPage('home');
  };

  // Discard session
  const discardSession = () => {
    setPpid('');
    setUploadedImageUrls([]);
    setCurrentPage('home');
  };

  // Determine which page to render
  if (isCapturing) {
    window.electronAPI.enableFullScreen();
    return (
      <ImageCaptureProcess
        onComplete={handleCaptureComplete}
        ppid={ppid}
        isTestMode={isTestMode}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Only render the titlebar when not in capture mode */}
      {!isCapturing && (
        <CustomTitlebar
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onClose={handleClose}
        />
      )}
      <div className="content-area">
        {(() => {
          switch (currentPage) {
            case 'home':
              return <HomePage onStartDefectChecker={startDefectChecker} />;
            case 'review':
              return (
                <ReviewImagesPage
                  ppid={ppid}
                  uploadedImageUrls={uploadedImageUrls}
                  onApprove={approveImages}
                  onRetake={retakeImages}
                  onDiscard={discardSession}
                />
              );
            case 'defect-analysis':
              return (
                <DefectAnalysisPage
                  ppid={ppid}
                  uploadedImageUrls={uploadedImageUrls}
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
