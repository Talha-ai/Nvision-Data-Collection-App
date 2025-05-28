import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import ReviewImagesPage from './components/ReviewImagesPage';
import DefectAnalysisPage from './components/DefectAnalysisPage';
import ImageCaptureProcess from './components/ImageCaptureProcess';
import CustomTitlebar from './components/customTitlebar';
import { CameraProvider } from './contexts/cameraContext';
import { LoginPage } from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import white_AAA from './assets/white_AAA.bmp';
import black_BBB from './assets/black_BBB.bmp';
import cyan_CCC from './assets/cyan_CCC.bmp';
import gray50_DDD from './assets/gray50_DDD.bmp';
import red_EEE from './assets/red_EEE.bmp';
import green_FFF from './assets/green_FFF.bmp';
import blue_GGG from './assets/blue_GGG.bmp';
import gray75_HHH from './assets/gray75_HHH.bmp';
import grayVertical_III from './assets/grayVertical_III.bmp';
import colorBars_JJJ from './assets/colorBars_JJJ.bmp';
import focus_KKK from './assets/focus_KKK.bmp';
import blackWithWhiteBorder_LLL from './assets/blackWithWhiteBorder_LLL.jpg';
import crossHatch_MMM from './assets/crossHatch_MMM.bmp';
import barGray_NNN from './assets/16BarGray_NNN.bmp';
import blackWhite_OOO from './assets/black&White_OOO.bmp';
import SummaryPage from './components/SummaryPage';
import PatternEBCPage from './components/PatternEBCPage';
import DataCollectionPage from './components/DataCollectionPage';
import DefectCheckerPage from './components/DefectCheckerPage';

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

const testPatterns = [
  { name: 'white_AAA', src: white_AAA },
  { name: 'black_BBB', src: black_BBB },
  { name: 'cyan_CCC', src: cyan_CCC },
  { name: 'gray50_DDD', src: gray50_DDD },
  { name: 'red_EEE', src: red_EEE },
  { name: 'green_FFF', src: green_FFF },
  { name: 'blue_GGG', src: blue_GGG },
  { name: 'gray75_HHH', src: gray75_HHH },
  { name: 'grayVertical_III', src: grayVertical_III },
  { name: 'colorBars_JJJ', src: colorBars_JJJ },
  { name: 'focus_KKK', src: focus_KKK },
  { name: 'blackWithWhiteBorder_LLL', src: blackWithWhiteBorder_LLL },
  { name: 'crossHatch_MMM', src: crossHatch_MMM },
  { name: '16BarGray_NNN', src: barGray_NNN },
  { name: 'black&White_OOO', src: blackWhite_OOO },
];

function App() {
  const [activePage, setActivePage] = useState('defect-checker');
  const [isCapturing, setIsCapturing] = useState(false);
  const [ppid, setPpid] = useState('');
  const [focusDistance, setFocusDistance] = useState();
  const [isTestMode, setIsTestMode] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [totalUploads, setTotalUploads] = useState(0);
  const [completedUploads, setCompletedUploads] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [failedUploadIndices, setFailedUploadIndices] = useState([]);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('sentinel_dash_token'));
  const [showSignup, setShowSignup] = useState(false);
  const [patternEBC, setPatternEBC] = useState(() => {
    const saved = localStorage.getItem('patternEBC');
    if (saved) return JSON.parse(saved);
    const testPatternsDefault = [
      { name: 'white_AAA', settings: { exposure: 0, brightness: 145, contrast: 145 } },
      { name: 'black_BBB', settings: { exposure: 0, brightness: 100, contrast: 145 } },
      { name: 'cyan_CCC', settings: { exposure: 0, brightness: 145, contrast: 145 } },
      { name: 'gray50_DDD', settings: { exposure: 20, brightness: 125, contrast: 125 } },
      { name: 'red_EEE', settings: { exposure: 45, brightness: 85, contrast: 125 } },
      { name: 'green_FFF', settings: { exposure: 45, brightness: 85, contrast: 145 } },
      { name: 'blue_GGG', settings: { exposure: 100, brightness: 125, contrast: 145 } },
      { name: 'gray75_HHH', settings: { exposure: 45, brightness: 85, contrast: 145 } },
      { name: 'grayVertical_III', settings: { exposure: 20, brightness: 125, contrast: 145 } },
      { name: 'colorBars_JJJ', settings: { exposure: 45, brightness: 85, contrast: 125 } },
      { name: 'focus_KKK', settings: { exposure: 10, brightness: 80, contrast: 125 } },
      { name: 'blackWithWhiteBorder_LLL', settings: { exposure: 10, brightness: 100, contrast: 80 } },
      { name: 'crossHatch_MMM', settings: { exposure: 45, brightness: 145, contrast: 145 } },
      { name: '16BarGray_NNN', settings: { exposure: 20, brightness: 125, contrast: 125 } },
      { name: 'black&White_OOO', settings: { exposure: 0, brightness: 145, contrast: 145 } },
    ];
    const obj = {};
    testPatternsDefault.forEach(({ name, settings }) => {
      obj[name] = { ...settings };
    });
    return obj;
  });
  const [username, setUsername] = useState(() => localStorage.getItem('sentinel_dash_username') || '');

  useEffect(() => {
    localStorage.setItem('patternEBC', JSON.stringify(patternEBC));
  }, [patternEBC]);

  useEffect(() => {
    const token = localStorage.getItem('sentinel_dash_token');
    setAuthToken(token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('sentinel_dash_token', token);
    setAuthToken(token);
    setShowSignup(false);
    setActivePage('defect-checker');
    const savedUsername = localStorage.getItem('sentinel_dash_username') || '';
    setUsername(savedUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('sentinel_dash_token');
    setAuthToken(null);
    setActivePage('login');
  };

  const navigateToSignup = () => setShowSignup(true);
  const navigateToLogin = () => setShowSignup(false);

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
    enteredPpid,
    mode,
    focusDistanceVal
  ) => {
    setPpid(enteredPpid);
    setIsTestMode(mode);
    setFocusDistance(focusDistanceVal);
    setIsCapturing(true);
  };

  // Handle when image capture is complete and uploads have started
  const handleCaptureComplete = (images, totalToUpload) => {
    window.electronAPI.disableFullScreen();
    setCapturedImages(images);
    setTotalUploads(totalToUpload);
    setIsUploading(true);
    setIsCapturing(false);
    setActivePage('review');
  };

  // Update upload progress
  const handleUploadProgress = (imageUrl, index) => {
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

  const approveImages = () => setActivePage('defect-analysis');
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
    setActivePage('defect-checker');
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
    setActivePage('defect-checker');
  };

  // Check if all uploads are complete
  useEffect(() => {
    if (isUploading && completedUploads === totalUploads && totalUploads > 0) {
      setIsUploading(false);
    }
  }, [completedUploads, totalUploads, isUploading]);

  useEffect(() => {
    if (isCapturing) {
      window.electronAPI.enableFullScreen();
    }
  }, [isCapturing]);

  // Navigation handler for sidebar
  const handleNavigate = (page) => {
    setActivePage(page);
  };

  // Map activePage to page title
  const pageTitles = {
    'defect-checker': 'Defect Checker',
    'data-collection': 'Data Collection',
    'summary': 'Summary',
    'pattern-ebc': 'Pattern EBC Settings',
    'review': 'Review Images',
    'defect-analysis': 'Defect Analysis',
    // Add more as needed
  };

  // Render the correct subpage/component
  const renderActivePage = () => {
    switch (activePage) {
      case 'defect-checker':
        return <DefectCheckerPage onStartDefectChecker={startDefectChecker} />;
      case 'data-collection':
        return <DataCollectionPage onStartDefectChecker={startDefectChecker} />;
      case 'summary':
        return <SummaryPage />;
      case 'pattern-ebc':
        return (
          <PatternEBCPage
            patternEBC={patternEBC}
            setPatternEBC={setPatternEBC}
            testPatterns={testPatterns}
            handleResetPatternEBC={() => {
              const testPatternsDefault = [
                { name: 'white_AAA', settings: { exposure: 0, brightness: 145, contrast: 145 } },
                { name: 'black_BBB', settings: { exposure: 0, brightness: 100, contrast: 145 } },
                { name: 'cyan_CCC', settings: { exposure: 0, brightness: 145, contrast: 145 } },
                { name: 'gray50_DDD', settings: { exposure: 20, brightness: 125, contrast: 125 } },
                { name: 'red_EEE', settings: { exposure: 45, brightness: 85, contrast: 125 } },
                { name: 'green_FFF', settings: { exposure: 45, brightness: 85, contrast: 145 } },
                { name: 'blue_GGG', settings: { exposure: 100, brightness: 125, contrast: 145 } },
                { name: 'gray75_HHH', settings: { exposure: 45, brightness: 85, contrast: 145 } },
                { name: 'grayVertical_III', settings: { exposure: 20, brightness: 125, contrast: 145 } },
                { name: 'colorBars_JJJ', settings: { exposure: 45, brightness: 85, contrast: 125 } },
                { name: 'focus_KKK', settings: { exposure: 10, brightness: 80, contrast: 125 } },
                { name: 'blackWithWhiteBorder_LLL', settings: { exposure: 10, brightness: 100, contrast: 80 } },
                { name: 'crossHatch_MMM', settings: { exposure: 45, brightness: 145, contrast: 145 } },
                { name: '16BarGray_NNN', settings: { exposure: 20, brightness: 125, contrast: 125 } },
                { name: 'black&White_OOO', settings: { exposure: 0, brightness: 145, contrast: 145 } },
              ];
              const obj = {};
              testPatternsDefault.forEach(({ name, settings }) => {
                obj[name] = { ...settings };
              });
              setPatternEBC(obj);
            }}
          />
        );
      default:
        return <div>Welcome!</div>;
    }
  };

  return (
    <CameraProvider>
      <div className="app-container">
        {!isCapturing && (
          <CustomTitlebar
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
          />
        )}
        <div className="content-area">
          {!authToken ? (
            showSignup ? (
              <SignUpPage
                onSignup={handleLogin}
                navigateToLogin={navigateToLogin}
              />
            ) : (
              <LoginPage
                onLogin={handleLogin}
                navigateToSignup={navigateToSignup}
              />
            )
          ) : isCapturing ? (
            <ImageCaptureProcess
              onComplete={handleCaptureComplete}
              onUploadProgress={handleUploadProgress}
              ppid={ppid}
              isTestMode={isTestMode}
              focusDistance={focusDistance}
              patternEBC={patternEBC}
            />
          ) : (
            <HomePage handleLogout={handleLogout} onNavigate={handleNavigate} activePage={activePage} pageTitle={pageTitles[activePage] || ''} username={username}>
              {activePage === 'review' ? (
                <ReviewImagesPage
                  ppid={ppid}
                  capturedImages={capturedImages}
                  onApprove={approveImages}
                  onRetake={retakeImages}
                  onDiscard={discardSession}
                />
              ) : activePage === 'defect-analysis' ? (
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
              ) : (
                renderActivePage()
              )}
            </HomePage>
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
