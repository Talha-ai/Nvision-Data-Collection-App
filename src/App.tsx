import React, { useState, useEffect, useRef } from 'react';
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
import { AppModeProvider } from './contexts/appModeContext';
import PastDataPage from './components/PastDataPage';
import PredictedDefectsPage from './components/PredictedDefectsPage';

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

// Dummy defects result set for PredictedDefectsPage
const dummyDefects = {
  'VID - Abnormal Display Defect Not Found': true,
  'VID - Horizontal Line Defect Not Found': true,
  'VID - Horizontal Band Defect Found': false,
  'VID - Vertical Line Defect Not Found': true,
  'VID - Vertical Band Defect Not Found': true,
  'VID - Particles Defect Not Found': true,
  'CID - White Patch Defect Not Found': true,
  'CID - Polariser Scratches / Dent Defect Not Found': true,
  'VID - Light Leakage Defect Not Found': true,
  'VID - Mura Defect Not Found': true,
  'VID - Incoming Border Patch Defect Not Found': true,
  'VID - Pixel Bright Dot Defect Not Found': true,
  'BER - Incoming Galaxy Defect Not Found': false,
  'VID - Led Off Defect Found': false,
  'VID - Bleeding Defect Not Found': false,
  'NTF - No Trouble Found Defect Not Found': true,
  'Other Defects Defect Not Found': true,
};

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
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem('sentinel_dash_token')
  );
  // const [showSignup, setShowSignup] = useState(false);
  const [patternEBC, setPatternEBC] = useState(() => {
    const saved = localStorage.getItem('patternEBC');
    if (saved) return JSON.parse(saved);
    const testPatternsDefault = [
      {
        name: 'white_AAA',
        settings: { exposure: 0, brightness: 145, contrast: 145 },
      },
      {
        name: 'black_BBB',
        settings: { exposure: 0, brightness: 100, contrast: 145 },
      },
      {
        name: 'cyan_CCC',
        settings: { exposure: 0, brightness: 145, contrast: 145 },
      },
      {
        name: 'gray50_DDD',
        settings: { exposure: 20, brightness: 125, contrast: 125 },
      },
      {
        name: 'red_EEE',
        settings: { exposure: 45, brightness: 85, contrast: 125 },
      },
      {
        name: 'green_FFF',
        settings: { exposure: 45, brightness: 85, contrast: 145 },
      },
      {
        name: 'blue_GGG',
        settings: { exposure: 100, brightness: 125, contrast: 145 },
      },
      {
        name: 'gray75_HHH',
        settings: { exposure: 45, brightness: 85, contrast: 145 },
      },
      {
        name: 'grayVertical_III',
        settings: { exposure: 20, brightness: 125, contrast: 145 },
      },
      {
        name: 'colorBars_JJJ',
        settings: { exposure: 45, brightness: 85, contrast: 125 },
      },
      {
        name: 'focus_KKK',
        settings: { exposure: 10, brightness: 80, contrast: 125 },
      },
      {
        name: 'blackWithWhiteBorder_LLL',
        settings: { exposure: 10, brightness: 100, contrast: 80 },
      },
      {
        name: 'crossHatch_MMM',
        settings: { exposure: 45, brightness: 145, contrast: 145 },
      },
      {
        name: '16BarGray_NNN',
        settings: { exposure: 20, brightness: 125, contrast: 125 },
      },
      {
        name: 'black&White_OOO',
        settings: { exposure: 0, brightness: 145, contrast: 145 },
      },
    ];
    const obj = {};
    testPatternsDefault.forEach(({ name, settings }) => {
      obj[name] = { ...settings };
    });
    return obj;
  });
  const [username, setUsername] = useState(
    () => localStorage.getItem('sentinel_dash_username') || ''
  );
  const [routineType, setRoutineType] = useState<
    'data-collection' | 'defect-checker'
  >('defect-checker');
  const [predictedDefects, setPredictedDefects] = useState(null); // for real API result
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [taskid, setTaskid] = useState();
  const pollingRef = useRef(null);

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
    // setShowSignup(false);
    setActivePage('defect-checker');
    const savedUsername = localStorage.getItem('sentinel_dash_username') || '';
    setUsername(savedUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('sentinel_dash_token');
    localStorage.removeItem('sentinel_dash_username');
    setAuthToken(null);
    setActivePage('login');
  };

  // const navigateToSignup = () => setShowSignup(true);
  // const navigateToLogin = () => setShowSignup(false);

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  // Start the defect checker or data collection routine
  const startDefectChecker = (ppid, isTestMode, focusDistance, routine) => {
    setPpid(ppid);
    setIsTestMode(isTestMode);
    setFocusDistance(focusDistance);
    setRoutineType(
      routine === 'data-collection' ? 'data-collection' : 'defect-checker'
    );
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
    setActivePage(routineType);
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
    setActivePage(routineType);
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
    summary: 'Data Collection Summary',
    'pattern-ebc': 'Pattern EBC Settings',
    review: 'Review Images',
    'defect-analysis': 'Defect Analysis',
    'past-data': 'Past Data',
    'predicted-defects': 'Predicted Defects',
    // Add more as needed
  };

  const startPrediction = async () => {
    setIsPredicting(true);
    setPredictedDefects(null);
    setPredictionError(null);
    try {
      // const token = localStorage.getItem('sentinel_dash_token');
      // if (!token) {
      //   setIsPredicting(false);
      //   setPredictedDefects({ error: 'No authentication token found. Please log in again.' });
      //   return;
      // }
      // Prepare panel_images array as in defectchecker
      const panel_images = uploadedImageUrls.map((url, idx) => ({
        panel: ppid,
        image_url: url,
        base_pattern: idx + 1,
      }));
      const payload = {
        ppid,
        test_type: isTestMode ? 'test' : 'production',
        inference: true,
        panel_images,
      };
      const response = await fetch(
        'https://nvision-staging.alemeno.com/data/display-panel/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to start prediction');
      }
      const data = await response.json();
      const task_uuid = data.tasks?.[0]?.task_uuid;
      if (!task_uuid) throw new Error('No task_uuid returned');
      // Poll for status
      setTaskid(task_uuid);
      pollPredictionStatus(task_uuid);
    } catch (err) {
      setIsPredicting(false);
      setPredictedDefects({ error: err.message || 'Prediction failed' });
      setPredictionError(err.message || 'Prediction failed');
    }
  };

  const pollPredictionStatus = async (task_uuid) => {
    try {
      const token = localStorage.getItem('sentinel_dash_token');
      if (!token) {
        setIsPredicting(false);
        setPredictedDefects({
          error: 'No authentication token found. Please log in again.',
        });
        setPredictionError(
          'No authentication token found. Please log in again.'
        );
        return;
      }
      const poll = async () => {
        const res = await fetch(
          `https://nvision-staging.alemeno.com/data/task/${task_uuid}/status/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!res.ok) {
          let errMsg = 'Failed to poll status';
          if (res.status === 401 || res.status === 403) {
            errMsg = 'Unauthorized. Please log in again.';
          } else {
            const errData = await res.json().catch(() => ({}));
            errMsg = errData.detail || errMsg;
          }
          setIsPredicting(false);
          setPredictedDefects({ error: errMsg });
          setPredictionError(errMsg);
          return;
        }
        const data = await res.json();
        const status = data.task?.status;
        if (status === 'completed') {
          setIsPredicting(false);
          setPredictedDefects(data.task.results?.defects || {});
          setPredictionError(null);
          if (pollingRef.current) clearTimeout(pollingRef.current);
        } else if (
          status === 'preprocessing_complete' ||
          status === 'queued' ||
          status === 'processing'
        ) {
          pollingRef.current = setTimeout(() => poll(), 5000);
        } else {
          setIsPredicting(false);
          setPredictedDefects({ error: 'Prediction failed or unknown status' });
          setPredictionError('Prediction failed or unknown status');
        }
      };
      poll();
    } catch (err) {
      setIsPredicting(false);
      setPredictedDefects({
        error: err.message || 'Prediction polling failed',
      });
      setPredictionError(err.message || 'Prediction polling failed');
    }
  };

  // Render the correct subpage/component
  const renderActivePage = () => {
    switch (activePage) {
      case 'data-collection':
        return <DataCollectionPage onStartDefectChecker={startDefectChecker} />;
      case 'defect-checker':
        return <DefectCheckerPage onStartDefectChecker={startDefectChecker} />;
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
                {
                  name: 'white_AAA',
                  settings: { exposure: 0, brightness: 145, contrast: 145 },
                },
                {
                  name: 'black_BBB',
                  settings: { exposure: 0, brightness: 100, contrast: 145 },
                },
                {
                  name: 'cyan_CCC',
                  settings: { exposure: 0, brightness: 145, contrast: 145 },
                },
                {
                  name: 'gray50_DDD',
                  settings: { exposure: 20, brightness: 125, contrast: 125 },
                },
                {
                  name: 'red_EEE',
                  settings: { exposure: 45, brightness: 85, contrast: 125 },
                },
                {
                  name: 'green_FFF',
                  settings: { exposure: 45, brightness: 85, contrast: 145 },
                },
                {
                  name: 'blue_GGG',
                  settings: { exposure: 100, brightness: 125, contrast: 145 },
                },
                {
                  name: 'gray75_HHH',
                  settings: { exposure: 45, brightness: 85, contrast: 145 },
                },
                {
                  name: 'grayVertical_III',
                  settings: { exposure: 20, brightness: 125, contrast: 145 },
                },
                {
                  name: 'colorBars_JJJ',
                  settings: { exposure: 45, brightness: 85, contrast: 125 },
                },
                {
                  name: 'focus_KKK',
                  settings: { exposure: 10, brightness: 80, contrast: 125 },
                },
                {
                  name: 'blackWithWhiteBorder_LLL',
                  settings: { exposure: 10, brightness: 100, contrast: 80 },
                },
                {
                  name: 'crossHatch_MMM',
                  settings: { exposure: 45, brightness: 145, contrast: 145 },
                },
                {
                  name: '16BarGray_NNN',
                  settings: { exposure: 20, brightness: 125, contrast: 125 },
                },
                {
                  name: 'black&White_OOO',
                  settings: { exposure: 0, brightness: 145, contrast: 145 },
                },
              ];
              const obj = {};
              testPatternsDefault.forEach(({ name, settings }) => {
                obj[name] = { ...settings };
              });
              setPatternEBC(obj);
            }}
          />
        );
      case 'past-data':
        return <PastDataPage />;
      // case 'predicted-defects':
      //   return (
      //     <PredictedDefectsPage
      //       defects={predictedDefects}
      //       onGoHome={() => {
      //         setPpid('');
      //         setCapturedImages([]);
      //         setUploadedImageUrls([]);
      //         setCompletedUploads(0);
      //         setTotalUploads(0);
      //         setIsUploading(false);
      //         setFailedUploadIndices([]);
      //         setActivePage('data-collection');
      //       }}
      //     />
      //   );
      default:
        return <div>Welcome!</div>;
    }
  };

  return (
    <AppModeProvider>
      <CameraProvider>
        <div className="app-container">
          {!isCapturing && (
            <div className="fixed top-0 left-0 w-full z-50">
              <CustomTitlebar
                onMinimize={handleMinimize}
                onMaximize={handleMaximize}
                onClose={handleClose}
              />
            </div>
          )}
          <div className={`content-area ${authToken ? 'pt-8' : ''}`}>
            {!authToken ? (
              // showSignup ? (
              //   <SignUpPage
              //     onSignup={handleLogin}
              //     navigateToLogin={navigateToLogin}
              //   />
              // ) : (
              <LoginPage
                onLogin={handleLogin}
                // navigateToSignup={navigateToSignup}
              />
            ) : // )
            isCapturing ? (
              <ImageCaptureProcess
                onComplete={handleCaptureComplete}
                onUploadProgress={handleUploadProgress}
                ppid={ppid}
                isTestMode={isTestMode}
                focusDistance={focusDistance}
                patternEBC={patternEBC}
              />
            ) : // subpages without sidebar/header
            activePage === 'review' ? (
              <>
                <header className="sticky w-screen top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                  <div className="text-xl font-semibold">
                    {routineType === 'data-collection'
                      ? 'Data Collection Review Page'
                      : 'Defect Checker Review Page'}
                  </div>
                </header>
                <div className="flex justify-center items-center min-h-screen bg-gray-100">
                  <div className="w-full max-w-3xl p-4">
                    <ReviewImagesPage
                      ppid={ppid}
                      capturedImages={capturedImages}
                      onApprove={async () => {
                        if (routineType === 'defect-checker') {
                          setActivePage('predicted-defects');
                          await startPrediction();
                        } else {
                          approveImages();
                        }
                      }}
                      onRetake={retakeImages}
                      onDiscard={discardSession}
                    />
                  </div>
                </div>
              </>
            ) : activePage === 'predicted-defects' ? (
              isPredicting ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <div className="text-lg font-semibold">
                    Processing images, please wait...
                  </div>
                </div>
              ) : predictedDefects && !predictedDefects.error ? (
                <>
                  <header className="sticky w-screen top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <div className="text-xl font-semibold">
                      {routineType === 'data-collection'
                        ? 'Data Collection Predicted Defects'
                        : 'Defect Checker Predicted Defects'}
                    </div>
                  </header>
                  <div className="flex justify-center items-center min-h-screen bg-gray-100">
                    <div className="w-full max-w-2xl p-4">
                      <PredictedDefectsPage
                        defects={predictedDefects}
                        onGoHome={() => {
                          setPpid('');
                          setCapturedImages([]);
                          setUploadedImageUrls([]);
                          setCompletedUploads(0);
                          setTotalUploads(0);
                          setIsUploading(false);
                          setFailedUploadIndices([]);
                          setActivePage('defect-checker');
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : predictedDefects && predictedDefects.error ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <div className="text-red-600 text-center p-8">
                    {predictedDefects.error}
                  </div>
                  {predictionError && (
                    <button
                      className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90"
                      onClick={() => pollPredictionStatus(taskid)}
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : null
            ) : activePage === 'defect-analysis' ? (
              <>
                <header className="sticky w-screen top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                  <div className="text-xl font-semibold">
                    {routineType === 'data-collection'
                      ? 'Data Collection Defect Analysis'
                      : 'Defect Checker Defect Analysis'}
                  </div>
                </header>
                <div className="flex justify-center items-center min-h-screen bg-gray-100">
                  <div className="w-full max-w-3xl p-4">
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
                  </div>
                </div>
              </>
            ) : (
              // All other pages remain inside HomePage (with sidebar/header)
              <HomePage
                handleLogout={handleLogout}
                onNavigate={handleNavigate}
                activePage={activePage}
                pageTitle={pageTitles[activePage] || ''}
                username={username}
              >
                {renderActivePage() || <></>}
              </HomePage>
            )}
          </div>
        </div>
      </CameraProvider>
    </AppModeProvider>
  );
}

export default App;
