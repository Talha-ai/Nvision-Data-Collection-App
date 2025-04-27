import React, { useState, useEffect } from 'react';
import white_AAA from '../assets/white_AAA.bmp';
import black_BBB from '../assets/black_BBB.bmp';
import cyan_CCC from '../assets/cyan_CCC.bmp';
import gray50_DDD from '../assets/gray50_DDD.bmp';
import red_EEE from '../assets/red_EEE.bmp';
import green_FFF from '../assets/green_FFF.bmp';
import blue_GGG from '../assets/blue_GGG.bmp';
import gray75_HHH from '../assets/gray75_HHH.bmp';
import grayVertical_III from '../assets/grayVertical_III.bmp';
import colorBars_JJJ from '../assets/colorBars_JJJ.bmp';
import focus_KKK from '../assets/focus_KKK.bmp';
import blackWithWhiteBorder_LLL from '../assets/blackWithWhiteBorder_LLL.jpg';
import crossHatch_MMM from '../assets/crossHatch_MMM.bmp';
import barGray_NNN from '../assets/16BarGray_NNN.bmp';
import blackWhite_OOO from '../assets/black&White_OOO.bmp';
import cameraGuide from '../assets/camera-guides.png';
import { useCamera } from '../contexts/cameraContext';

interface HomePageProps {
  onStartDefectChecker: (
    ppid: string,
    isTestMode: boolean,
    darkexposure: number,
    lightexposure: number,
    focusDistance: number
  ) => void;
}

interface Pattern {
  pattern_name: string;
  created_at: string;
  order: number;
}

interface DefectStat {
  defect_name: string;
  fault_code: string;
  panel_count: number;
}

interface StatsData {
  total_images_captured: number;
  total_panels_tested: number;
  defect_statistics: DefectStat[];
}

const patternNameToFileName = {
  White: 'white_AAA.bmp',
  Black: 'black_BBB.bmp',
  Cyan: 'cyan_CCC.bmp',
  Gray50: 'gray50_DDD.bmp',
  Red: 'red_EEE.bmp',
  Green: 'green_FFF.bmp',
  Blue: 'blue_GGG.bmp',
  Gray75: 'gray75_HHH.bmp',
  'Gray Vertical': 'grayVertical_III.bmp',
  'Color Bars': 'colorBars_JJJ.bmp',
  Focus: 'focus_KKK.bmp',
  'Black with white border': 'blackWithWhiteBorder_LLL.jpg',
  Crosshatch: 'crossHatch_MMM.bmp',
  '16 Bar Gray': '16BarGray_NNN.bmp',
  'Black and White Blocks': 'black&White_OOO.bmp',
};

function HomePage({ onStartDefectChecker }: HomePageProps) {
  const [ppid, setPpid] = useState<string>('');

  const [isTestMode, setIsTestMode] = useState(() => {
    const savedMode = localStorage.getItem('appMode');
    return savedMode ? savedMode === 'test' : false;
  });
  const [lightexposure, setLightexposure] = useState(() => {
    const savedLight = localStorage.getItem('lightexposure');
    return savedLight ? Number(savedLight) : 80;
  });

  const [darkexposure, setDarkexposure] = useState(() => {
    const savedDark = localStorage.getItem('darkexposure');
    return savedDark ? Number(savedDark) : 200;
  });
  const [focusDistance, setFocusDistance] = useState(() => {
    const savedDistance = localStorage.getItem('focusDistance');
    return savedDistance ? Number(savedDistance) : 125;
  });

  const [showHiddenState, setShowHiddenState] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [fullStatsData, setFullStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('summary');
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [defects, setDefects] = useState([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cameraRefreshTrigger, setCameraRefreshTrigger] = useState<number>(0);
  const [fullscreenPattern, setFullscreenPattern] = useState<string | null>(
    null
  );
  // const [brightness, setBrightness] = useState(128);
  // const [exposureCompensation, setExposureCompensation] = useState(128);

  const {
    setupCamera,
    stopCamera,
    isCameraReady,
    cameraResolution,
    adjustCameraSettings,
    videoRef,
  } = useCamera();

  const patternImportMap = {
    'white_AAA.bmp': white_AAA,
    'black_BBB.bmp': black_BBB,
    'cyan_CCC.bmp': cyan_CCC,
    'gray50_DDD.bmp': gray50_DDD,
    'red_EEE.bmp': red_EEE,
    'green_FFF.bmp': green_FFF,
    'blue_GGG.bmp': blue_GGG,
    'gray75_HHH.bmp': gray75_HHH,
    'grayVertical_III.bmp': grayVertical_III,
    'colorBars_JJJ.bmp': colorBars_JJJ,
    'focus_KKK.bmp': focus_KKK,
    'blackWithWhiteBorder_LLL.jpg': blackWithWhiteBorder_LLL,
    'crossHatch_MMM.bmp': crossHatch_MMM,
    '16BarGray_NNN.bmp': barGray_NNN,
    'black&White_OOO.bmp': blackWhite_OOO,
  };

  // Function to toggle fullscreen for a pattern
  const handlePatternClick = (patternFileName: string) => {
    setCameraRefreshTrigger((prev) => prev + 1);
    if (fullscreenPattern === null) {
      setFullscreenPattern(patternFileName);
      window.electronAPI.enableFullScreen();
    }
  };

  // Function to exit fullscreen
  const handleExitFullscreen = () => {
    setFullscreenPattern(null);
    window.electronAPI.disableFullScreen();
  };

  useEffect(() => {
    localStorage.setItem('appMode', isTestMode ? 'test' : 'production');
  }, [isTestMode]);

  useEffect(() => {
    localStorage.setItem('lightexposure', lightexposure.toString());
  }, [lightexposure]);

  useEffect(() => {
    localStorage.setItem('darkexposure', darkexposure.toString());
  }, [darkexposure]);

  useEffect(() => {
    localStorage.setItem('focusDistance', focusDistance.toString());
  }, [focusDistance]);

  // Combined function to fetch both patterns and statistics
  const fetchData = async () => {
    setLoading(true);
    setStatsLoading(true);

    try {
      // Fetch patterns
      const patternsPromise = fetch(
        'https://nvision.alemeno.com/data/base-pattern/'
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch patterns');
          }
          return response.json();
        })
        .then((data) => {
          setPatterns(data);
          setLoading(false);
        });

      // Fetch statistics
      const statsPromise = fetch(
        'https://nvision.alemeno.com/data/panel-image-search/stats/'
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch statistics');
          }
          return response.json();
        })
        .then((data) => {
          setFullStatsData(data);

          const modeData = isTestMode ? data.test : data.production;

          setStatsData(modeData);
          setDefects(modeData.defect_statistics);
          setStatsLoading(false);
        });

      // Wait for both requests to complete
      await Promise.all([patternsPromise, statsPromise]);

      // Trigger camera refresh after data is loaded
      setCameraRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fullStatsData) {
      const modeData = isTestMode
        ? fullStatsData.test
        : fullStatsData.production;
      setStatsData(modeData);
      setDefects(modeData.defect_statistics);
    }
  }, [isTestMode, fullStatsData]);

  useEffect(() => {
    setupCamera();
  }, []);

  useEffect(() => {
    const initCamera = async () => {
      await setupCamera();
    };

    initCamera();

    return () => {
      stopCamera();
    };
  }, [cameraRefreshTrigger]);

  useEffect(() => {
    if (isCameraReady) {
      adjustCameraSettings({
        focusMode: 'manual',
        focusDistance: focusDistance,
      });
    }
  }, [isCameraReady, focusDistance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ppid.trim()) {
      setSubmitLoading(true);
      setSubmitError(null);

      try {
        const checkResponse = await fetch(
          'https://nvision.alemeno.com/data/display-panel/check_display_panel/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ppid: ppid }),
          }
        );

        if (!checkResponse.ok) {
          throw new Error(
            `Server responded with status: ${checkResponse.status}`
          );
        }

        const checkData = await checkResponse.json();
        const finalPpid = checkData.exists ? checkData.recommended_ppid : ppid;

        onStartDefectChecker(
          finalPpid,
          isTestMode,
          darkexposure,
          lightexposure,
          focusDistance
        );
      } catch (error) {
        console.error('Error submitting PPID:', error);
        setSubmitError(
          error instanceof Error ? error.message : 'An unknown error occurred'
        );
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const handlePpidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPpid(e.target.value);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto p-4">
      <h1
        className="text-2xl font-bold text-center my-4"
        onDoubleClick={() => setShowHiddenState((prev) => !prev)}
      >
        Nvision AI Data Collection App
      </h1>

      <button
        className="rounded-full border border-green-500 text-green-500 px-4 py-1 mb-6 flex items-center"
        onClick={fetchData}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>

      {showHiddenState && (
        <>
          <div className="text-center mb-4">
            {cameraResolution ? (
              <p>
                Camera Resolution: {cameraResolution.width} x{' '}
                {cameraResolution.height}
              </p>
            ) : (
              <p>Loading camera...</p>
            )}
          </div>

          <div className="flex items-center mb-6">
            <label className="bg-gray-200 px-3 py-2 border border-gray-300 flex-shrink-0">
              Mode
            </label>
            <select
              value={isTestMode ? 'test' : 'production'}
              onChange={(e) => setIsTestMode(e.target.value === 'test')}
              className="flex-grow border border-gray-300 px-3 py-2"
            >
              <option value="test">Test</option>
              <option value="production">Production</option>
            </select>
          </div>

          {/* Camera settings sliders */}
          <div className="space-y-4 mb-6">
            {/* <div>
              <div className="flex justify-between">
                <label className="font-medium">Brightness: {brightness}</label>
                <span className="text-gray-500 text-sm">(Range: 0 - 255)</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="font-medium">
                  Exposure Compensation: {exposureCompensation}
                </label>
                <span className="text-gray-500 text-sm">(Range: 0 - 255)</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={exposureCompensation}
                onChange={(e) =>
                  setExposureCompensation(Number(e.target.value))
                }
                className="w-full"
              />
            </div> */}

            <div>
              <div className="flex justify-between">
                <label className="font-medium">
                  Light Image Exposure: {lightexposure}
                </label>
                <span className="text-gray-500 text-sm">(Range: 0 - 255)</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={lightexposure}
                onChange={(e) => setLightexposure(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="font-medium">
                  Dark Images Exposure: {darkexposure}
                </label>
                <span className="text-gray-500 text-sm">(Range: 0 - 255)</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={darkexposure}
                onChange={(e) => setDarkexposure(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="font-medium">
                  Focus Distance: {focusDistance}
                </label>
                <span className="text-gray-500 text-sm">(Range: 0 - 250)</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="5"
                value={focusDistance}
                onChange={(e) => setFocusDistance(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}

      <div className="aspect-video w-full h-full bg-gray-200 relative mb-4">
        <img
          src={cameraGuide}
          alt="Camera guide"
          className="absolute w-[90%] m-auto inset-0 object-contain pointer-events-none z-10 hidden"
        />
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <p className="text-xs mb-8">
        Note: Please place the display panel roughly within the guides before
        starting the routine
      </p>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex justify-between items-center text-sm w-full mb-5 gap-10">
          <div className="flex items-center ">
            <div className="bg-gray-200 px-3 py-2 border border-gray-300 flex-shrink-0">
              Enter PPID
            </div>
            <input
              type="text"
              value={ppid}
              onChange={handlePpidChange}
              className="flex-grow border border-gray-300 px-3 py-2"
              placeholder="abcd123456789"
            />
          </div>
          <button
            type="submit"
            className={`${
              ppid && !submitLoading
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400'
            } text-white px-6 py-2 rounded transition-colors min-w-[220px] text-center`}
            disabled={!ppid || submitLoading}
          >
            {submitLoading ? 'Processing...' : 'Start Defect Checker Routine'}
          </button>
        </div>
        {submitError && (
          <div className=" text-red-600 text-sm">Error: {submitError}</div>
        )}
      </form>

      <div className="w-full">
        {/* Tabs */}
        <div className="flex border-b-2">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'summary' ? 'border-b-2 border-black' : ''
            }`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'pattern' ? 'border-b-2 border-black' : ''
            }`}
            onClick={() => setActiveTab('pattern')}
          >
            Pattern order
          </button>
        </div>

        {/* Content */}
        <div className="my-6 w-full">
          {activeTab === 'summary' && (
            <div>
              {statsLoading ? (
                <p>Loading statistics...</p>
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">Total panels tested</td>
                      <td className="py-3">
                        {statsData ? statsData.total_panels_tested : 0}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Total images captured</td>
                      <td className="py-3">
                        {statsData ? statsData.total_images_captured : 0}
                      </td>
                    </tr>
                    {defects.map((defect, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3">
                          Panels with {defect.defect_name}
                        </td>
                        <td className="py-3">{defect.panel_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'pattern' && (
            <div>
              {fullscreenPattern ? (
                // Fullscreen pattern view
                <div
                  className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
                  onDoubleClick={handleExitFullscreen}
                >
                  {patternImportMap[fullscreenPattern] ? (
                    <img
                      src={patternImportMap[fullscreenPattern]}
                      alt={fullscreenPattern}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-white text-xl">No image available</div>
                  )}

                  <div className="w-96 h-40 bg-gray-800 absolute bottom-10">
                    <img
                      src={cameraGuide}
                      alt="Camera guide"
                      className="absolute w-[90%] m-auto inset-0 object-contain pointer-events-none z-10"
                    />
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-96 h-full object-cover"
                    />
                  </div>

                  <div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 px-3 py-2 rounded">
                    Double-click to exit fullscreen
                  </div>
                </div>
              ) : // Regular pattern table view
              loading ? (
                <p>Loading patterns...</p>
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {patterns.map((pattern, index) => {
                      const fileName =
                        patternNameToFileName[pattern.pattern_name];
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-3 w-12 text-center">
                            {pattern.order + 1}
                          </td>
                          <td className="py-3">
                            <div
                              className="border border-black w-24 cursor-pointer"
                              onClick={() =>
                                fileName && handlePatternClick(fileName)
                              }
                            >
                              {fileName && patternImportMap[fileName] ? (
                                <img
                                  src={patternImportMap[fileName]}
                                  alt={pattern.pattern_name}
                                />
                              ) : (
                                <div className="bg-gray-200 w-full h-12 flex items-center justify-center">
                                  No image
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {fileName || 'No file mapping'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
