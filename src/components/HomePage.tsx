import React, { useState, useRef, useEffect } from 'react';
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

interface HomePageProps {
  onStartDefectChecker: (ppid: string, isTestMode: boolean) => void;
}

interface Pattern {
  pattern_name: string;
  created_at: string;
  order: number;
}

interface DefectStat {
  defect_name: string;
  fault_code: string;
  image_count: number;
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
  const [showHiddenState, setShowHiddenState] = useState<boolean>(false);
  const [defects, setDefects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fullStatsData, setFullStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('summary');
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraResolution, setCameraResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);

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

  useEffect(() => {
    localStorage.setItem('appMode', isTestMode ? 'test' : 'production');
  }, [isTestMode]);

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
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        const physicalCameras = videoDevices.filter(
          (device) =>
            !device.label.includes('OBS') && !device.label.includes('Virtual')
        );

        const deviceId =
          physicalCameras.length > 0 ? physicalCameras[0].deviceId : undefined;

        const constraints = {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        };
        // navigator.mediaDevices.enumerateDevices().then((devices) => {
        //   const videoDevices = devices.filter(
        //     (device) => device.kind === 'videoinput'
        //   );
        //   console.log('Available video devices:', videoDevices);
        // });

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        setCameraResolution({ width: settings.width, height: settings.height });

        // const videoTracks = stream.getVideoTracks();
        // console.log(videoTracks);
        // const capab = videoTracks[0].getCapabilities();
        // console.log(capab);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setupCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

        onStartDefectChecker(finalPpid, isTestMode);
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
        </>
      )}

      <div className="aspect-video w-full h-full bg-gray-200 relative mb-4">
        {/* Overlay guide image */}
        <img
          src={cameraGuide}
          alt="Camera guide"
          className="absolute w-[90%] m-auto inset-0 object-contain pointer-events-none z-10"
        />

        {/* Video preview */}
        <video ref={videoRef} autoPlay playsInline className=" object-cover" />
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
              {loading ? (
                <p>Loading patterns...</p>
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {patterns.map((pattern, index) => {
                      const fileName =
                        patternNameToFileName[pattern.pattern_name];
                      console.log(pattern.pattern_name);
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-3 w-12 text-center">
                            {pattern.order + 1}
                          </td>
                          <td className="py-3">
                            <div className="border border-black w-24">
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
                          {/* <td className="py-3">{pattern.pattern_name}</td> */}
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
