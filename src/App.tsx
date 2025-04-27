import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import ReviewImagesPage from './components/ReviewImagesPage';
import DefectAnalysisPage from './components/DefectAnalysisPage';
import ImageCaptureProcess from './components/ImageCaptureProcess';
import CustomTitlebar from './components/customTitlebar';
import { CameraProvider } from './contexts/cameraContext';

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

// Define test patterns for consistency across components
const testPatterns = [
  { name: 'white_AAA' },
  { name: 'black_BBB' },
  { name: 'cyan_CCC' },
  { name: 'gray50_DDD' },
  { name: 'red_EEE' },
  { name: 'green_FFF' },
  { name: 'blue_GGG' },
  { name: 'gray75_HHH' },
  { name: 'grayVertical_III' },
  { name: 'colorBars_JJJ' },
  { name: 'focus_KKK' },
  { name: 'blackWithWhiteBorder_LLL' },
  { name: 'crossHatch_MMM' },
  { name: '16BarGray_NNN' },
  { name: 'black&White_OOO' },
];

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [ppid, setPpid] = useState<string>('');
  const [darkexposure, setDarkexposure] = useState();
  const [lightexposure, setLightexposure] = useState();
  const [focusDistance, setFocusDistance] = useState();
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  // Track upload progress
  const [uploadedImageUrls, setUploadedImageUrls] = useState<(string | null)[]>(
    []
  );
  const [totalUploads, setTotalUploads] = useState<number>(0);
  const [completedUploads, setCompletedUploads] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [failedUploadIndices, setFailedUploadIndices] = useState<number[]>([]);

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
  const startDefectChecker = (
    enteredPpid: string,
    mode: boolean,
    darkexposure: number,
    lightexposure: number,
    focusDistance: number
  ) => {
    setPpid(enteredPpid);
    setIsTestMode(mode);
    setDarkexposure(darkexposure);
    setLightexposure(lightexposure);
    setLightexposure(lightexposure);
    setFocusDistance(focusDistance);
    setIsCapturing(true);
  };

  // Handle when image capture is complete and uploads have started
  const handleCaptureComplete = (images: string[], totalToUpload: number) => {
    window.electronAPI.disableFullScreen();
    setCapturedImages(images);
    setTotalUploads(totalToUpload);
    setIsUploading(true);
    setIsCapturing(false);
    setCurrentPage('review');
  };

  // Update upload progress
  const handleUploadProgress = (imageUrl: string | null, index: number) => {
    setUploadedImageUrls((prev) => {
      const newUrls = [...prev];
      newUrls[index] = imageUrl;
      return newUrls;
    });

    // Track failed uploads
    if (imageUrl === null) {
      setFailedUploadIndices((prev) => [...prev, index]);
    }

    setCompletedUploads((prev) => prev + 1);
  };

  // Function to retry failed uploads
  const retryFailedUploads = async () => {
    if (failedUploadIndices.length === 0) return;

    // Reset uploading state
    setIsUploading(true);

    // Process each failed upload
    for (const index of failedUploadIndices) {
      if (index < capturedImages.length) {
        try {
          const imageData = capturedImages[index];
          const patternName = testPatterns[index].name;

          const imageUrl = await window.electronAPI.uploadImage({
            imageData,
            ppid,
            patternName,
            isTestMode,
          });

          // Update success
          setUploadedImageUrls((prev) => {
            const newUrls = [...prev];
            newUrls[index] = imageUrl;
            return newUrls;
          });

          console.log(`Successfully re-uploaded ${patternName}`);
        } catch (error) {
          console.error(`Failed to re-upload image at index ${index}:`, error);
          // Leave as null in the array
        }
      }
    }

    // Clear failed indices as we've attempted them all
    setFailedUploadIndices([]);
    setIsUploading(false);
  };

  // Approve images and go to defect analysis
  const approveImages = () => {
    setCurrentPage('defect-analysis');
  };

  // Retake images
  const retakeImages = () => {
    // Reset upload states
    setUploadedImageUrls([]);
    setCompletedUploads(0);
    setTotalUploads(0);
    setIsUploading(false);
    setFailedUploadIndices([]);
    setIsCapturing(true);
  };

  // Submit defect analysis and go back to home page
  const submitDefectAnalysis = () => {
    setPpid('');
    setCapturedImages([]);
    setUploadedImageUrls([]);
    setCompletedUploads(0);
    setTotalUploads(0);
    setIsUploading(false);
    setFailedUploadIndices([]);
    setCurrentPage('home');
  };

  // Discard session
  const discardSession = () => {
    setPpid('');
    setCapturedImages([]);
    setUploadedImageUrls([]);
    setCompletedUploads(0);
    setTotalUploads(0);
    setIsUploading(false);
    setFailedUploadIndices([]);
    setCurrentPage('home');
  };

  // Check if all uploads are complete
  useEffect(() => {
    if (isUploading && completedUploads === totalUploads && totalUploads > 0) {
      setIsUploading(false);
    }
  }, [completedUploads, totalUploads, isUploading]);

  // Determine which page to render
  // if (isCapturing) {
  //   window.electronAPI.enableFullScreen();
  //   return (
  //     <ImageCaptureProcess
  //       onComplete={handleCaptureComplete}
  //       onUploadProgress={handleUploadProgress}
  //       ppid={ppid}
  //       isTestMode={isTestMode}
  //       darkexposure={darkexposure}
  //       lightexposure={lightexposure}
  //       focusDistance={focusDistance}
  //     />
  //   );
  // }

  return (
    <CameraProvider>
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
          {isCapturing ? (
            <ImageCaptureProcess
              onComplete={handleCaptureComplete}
              onUploadProgress={handleUploadProgress}
              ppid={ppid}
              isTestMode={isTestMode}
              darkexposure={darkexposure}
              lightexposure={lightexposure}
              focusDistance={focusDistance}
            />
          ) : (
            (() => {
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
                      isTestMode={isTestMode}
                      uploadedImageUrls={uploadedImageUrls}
                      onSubmit={submitDefectAnalysis}
                      onDiscard={discardSession}
                      uploadProgress={completedUploads}
                      totalUploads={totalUploads}
                      isUploading={isUploading}
                      failedUploadCount={failedUploadIndices.length}
                      onRetryUploads={retryFailedUploads}
                    />
                  );
                default:
                  return <HomePage onStartDefectChecker={startDefectChecker} />;
              }
            })()
          )}
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
    </CameraProvider>
  );
}

export default App;
