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
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

interface HomePageProps {
  onStartDefectChecker: (
    ppid: string,
    isTestMode: boolean,
    // cluster1: number,
    // cluster2: number,
    // cluster3: number,
    // cluster4: number,
    focusDistance: number
  ) => void;
  handleLogout: () => void;
  patternEBC: PatternEBCState;
  setPatternEBC: React.Dispatch<React.SetStateAction<PatternEBCState>>;
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

// Define the testPatterns array with EBC defaults
const testPatterns = [
  {
    name: 'white_AAA',
    src: white_AAA,
    settings: { exposure: 0, brightness: 145, contrast: 145 },
  },
  {
    name: 'black_BBB',
    src: black_BBB,
    settings: { exposure: 0, brightness: 100, contrast: 145 },
  },
  {
    name: 'cyan_CCC',
    src: cyan_CCC,
    settings: { exposure: 0, brightness: 145, contrast: 145 },
  },
  {
    name: 'gray50_DDD',
    src: gray50_DDD,
    settings: { exposure: 20, brightness: 125, contrast: 125 },
  },
  {
    name: 'red_EEE',
    src: red_EEE,
    settings: { exposure: 45, brightness: 85, contrast: 125 },
  },
  {
    name: 'green_FFF',
    src: green_FFF,
    settings: { exposure: 45, brightness: 85, contrast: 145 },
  },
  {
    name: 'blue_GGG',
    src: blue_GGG,
    settings: { exposure: 100, brightness: 125, contrast: 145 },
  },
  {
    name: 'gray75_HHH',
    src: gray75_HHH,
    settings: { exposure: 45, brightness: 85, contrast: 145 },
  },
  {
    name: 'grayVertical_III',
    src: grayVertical_III,
    settings: { exposure: 20, brightness: 125, contrast: 145 },
  },
  {
    name: 'colorBars_JJJ',
    src: colorBars_JJJ,
    settings: { exposure: 45, brightness: 85, contrast: 125 },
  },
  {
    name: 'focus_KKK',
    src: focus_KKK,
    settings: { exposure: 10, brightness: 80, contrast: 125 },
  },
  {
    name: 'blackWithWhiteBorder_LLL',
    src: blackWithWhiteBorder_LLL,
    settings: { exposure: 10, brightness: 100, contrast: 80 },
  },
  {
    name: 'crossHatch_MMM',
    src: crossHatch_MMM,
    settings: { exposure: 45, brightness: 145, contrast: 145 },
  },
  {
    name: '16BarGray_NNN',
    src: barGray_NNN,
    settings: { exposure: 20, brightness: 125, contrast: 125 },
  },
  {
    name: 'black&White_OOO',
    src: blackWhite_OOO,
    settings: { exposure: 0, brightness: 145, contrast: 145 },
  },
];

type EBC = { exposure: number; brightness: number; contrast: number };
type PatternEBCState = { [pattern: string]: EBC };

const defaultPatternEBC = () => {
  const obj = {};
  testPatterns.forEach(({ name, settings }) => {
    obj[name] = { ...settings };
  });
  return obj;
};

const defaultLiveSettings = {
  exposure: 125,
  brightness: 125,
  contrast: 125,
  focusDistance: 40,
};

function HomePage({
  onStartDefectChecker,
  patternEBC,
  setPatternEBC,
  handleLogout,
}: HomePageProps) {
  const [ppid, setPpid] = useState<string>('');

  const [isTestMode, setIsTestMode] = useState(() => {
    const savedMode = localStorage.getItem('appMode');
    return savedMode ? savedMode === 'test' : false;
  });
  // const [cluster1, setCluster1] = useState(() => {
  //   const saved = localStorage.getItem('cluster1');
  //   return saved ? Number(saved) : 20;
  // });
  // const [cluster2, setCluster2] = useState(() => {
  //   const saved = localStorage.getItem('cluster2');
  //   return saved ? Number(saved) : 60;
  // });
  // const [cluster3, setCluster3] = useState(() => {
  //   const saved = localStorage.getItem('cluster3');
  //   return saved ? Number(saved) : 100;
  // });
  const [exposure, setExposure] = useState(() => {
    const saved = localStorage.getItem('exposure');
    return saved ? Number(saved) : 140;
  });
  const [focusDistance, setFocusDistance] = useState(() => {
    const savedDistance = localStorage.getItem('focusDistance');
    return savedDistance ? Number(savedDistance) : 125;
  });
  const [brightness, setBrightness] = useState(() => {
    const savedBrightness = localStorage.getItem('brightness');
    return savedBrightness ? Number(savedBrightness) : 125;
  });
  const [contrast, setContrast] = useState(() => {
    const savedContrast = localStorage.getItem('contrast');
    return savedContrast ? Number(savedContrast) : 125;
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
  // const [fullscreenPattern, setFullscreenPattern] = useState<string | null>(
  //   null
  // );

  const {
    setupCamera,
    isCameraReady,
    // cameraResolution,
    adjustCameraSettings,
    videoRef,
  } = useCamera();

  const [isManual, setIsManual] = useState(false);

  // const patternImportMap = {
  //   'white_AAA.bmp': white_AAA,
  //   'black_BBB.bmp': black_BBB,
  //   'cyan_CCC.bmp': cyan_CCC,
  //   'gray50_DDD.bmp': gray50_DDD,
  //   'red_EEE.bmp': red_EEE,
  //   'green_FFF.bmp': green_FFF,
  //   'blue_GGG.bmp': blue_GGG,
  //   'gray75_HHH.bmp': gray75_HHH,
  //   'grayVertical_III.bmp': grayVertical_III,
  //   'colorBars_JJJ.bmp': colorBars_JJJ,
  //   'focus_KKK.bmp': focus_KKK,
  //   'blackWithWhiteBorder_LLL.jpg': blackWithWhiteBorder_LLL,
  //   'crossHatch_MMM.bmp': crossHatch_MMM,
  //   '16BarGray_NNN.bmp': barGray_NNN,
  //   'black&White_OOO.bmp': blackWhite_OOO,
  // };

  // Function to toggle fullscreen for a pattern
  // const handlePatternClick = (patternFileName: string) => {
  //   if (fullscreenPattern === null) {
  //     setFullscreenPattern(patternFileName);
  //     window.electronAPI.enableFullScreen();
  //   }
  // };

  // Function to exit fullscreen
  // const handleExitFullscreen = () => {
  //   setFullscreenPattern(null);
  //   window.electronAPI.disableFullScreen();
  // };

  useEffect(() => {
    localStorage.setItem('appMode', isTestMode ? 'test' : 'production');
  }, [isTestMode]);

  // useEffect(() => {
  //   localStorage.setItem('cluster1', cluster1.toString());
  // }, [cluster1]);

  // useEffect(() => {
  //   localStorage.setItem('cluster2', cluster2.toString());
  // }, [cluster2]);

  // useEffect(() => {
  //   localStorage.setItem('cluster3', cluster3.toString());
  // }, [cluster3]);

  useEffect(() => {
    localStorage.setItem('exposure', exposure.toString());
  }, [exposure]);

  useEffect(() => {
    localStorage.setItem('focusDistance', focusDistance.toString());
  }, [focusDistance]);
  useEffect(() => {
    localStorage.setItem('brightness', brightness.toString());
  }, [brightness]);
  useEffect(() => {
    localStorage.setItem('contrast', contrast.toString());
  }, [contrast]);

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
  }, [cameraRefreshTrigger]);

  useEffect(() => {
    if (isCameraReady) {
      adjustCameraSettings({
        exposureMode: isManual ? 'manual' : 'continuous',
        focusMode: isManual ? 'manual' : 'continuous',
        focusDistance: focusDistance,
        brightness: brightness,
        contrast: contrast,
        exposureCompensation: exposure,
        exposureTime: 50,
      });
    }
  }, [isCameraReady, focusDistance, brightness, contrast, exposure, isManual]);

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
          // cluster1,
          // cluster2,
          // cluster3,
          // cluster4,
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

  // Reset handlers
  const handleResetPatternEBC = () => setPatternEBC(defaultPatternEBC());
  const handleResetLiveSettings = () => {
    setExposure(defaultLiveSettings.exposure);
    setBrightness(defaultLiveSettings.brightness);
    setContrast(defaultLiveSettings.contrast);
    setFocusDistance(defaultLiveSettings.focusDistance);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <SidebarProvider>
        <AppSidebar handleLogout={handleLogout} />
        <SidebarInset className="bg-gray-100">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <div className="text-xl font-semibold">
              {activeTab === 'summary' && 'Defect Checker'}
              {activeTab === 'pattern' && 'Pattern EBC Settings'}
            </div>
          </header>
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {/* Main content */}
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Defect Checker Routine</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
                    <input
                      type="text"
                      value={ppid}
                      onChange={handlePpidChange}
                      className="flex-grow border border-gray-300 px-3 py-2 rounded"
                      placeholder="Enter PPID"
                    />
                    <Button type="submit" disabled={!ppid || submitLoading}>
                      {submitLoading
                        ? 'Processing...'
                        : 'Start Defect Checker Routine'}
                    </Button>
                    {/* <button
                      onClick={() => {
                        throw new Error('This is your first error!');
                      }}
                    >
                      Sentry Test
                    </button> */}
                  </form>
                  <div className="aspect-video w-full h-full bg-gray-200 relative mb-4 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* <div className="flex items-center gap-4 mb-2">
                    <span className="font-semibold">App mode:</span>
                    <Button
                      variant={isTestMode ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => setIsTestMode(false)}
                    >
                      Production
                    </Button>
                    <Button
                      variant={isTestMode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsTestMode(true)}
                    >
                      Test
                    </Button>
                  </div> */}

                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-semibold">App mode:</span>
                    <div className="relative">
                      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                        <button
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            !isTestMode
                              ? 'bg-green-500 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                              : ' text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                          onClick={() => setIsTestMode(false)}
                        >
                          Production
                        </button>
                        <button
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            isTestMode
                              ? 'bg-yellow-500 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                              : ' text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                          onClick={() => setIsTestMode(true)}
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => setShowHiddenState((prev) => !prev)}
                  >
                    {showHiddenState
                      ? 'Hide camera settings'
                      : 'Show camera settings'}
                  </Button>
                  {showHiddenState && (
                    <div className="mt-4 space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Live Camera Feed Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">Mode:</span>
                              <div className="relative">
                                <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                                  <button
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                      isManual
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                    onClick={() => setIsManual(true)}
                                  >
                                    Manual
                                  </button>
                                  <button
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                      !isManual
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                    onClick={() => setIsManual(false)}
                                  >
                                    Automatic
                                  </button>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="ml-auto"
                              onClick={handleResetLiveSettings}
                            >
                              Reset Live Settings
                            </Button>
                          </div>
                          <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[180px]">
                              <label className="block font-medium">Focus</label>
                              <input
                                type="range"
                                min="0"
                                max="250"
                                step="5"
                                value={focusDistance}
                                onChange={(e) =>
                                  setFocusDistance(Number(e.target.value))
                                }
                              />
                              <span className="text-xs">{focusDistance}</span>
                            </div>
                            <div className="flex-1 min-w-[180px]">
                              <label className="block font-medium">
                                Exposure
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="255"
                                value={exposure}
                                onChange={(e) =>
                                  setExposure(Number(e.target.value))
                                }
                              />
                              <span className="text-xs">{exposure}</span>
                            </div>
                            <div className="flex-1 min-w-[180px]">
                              <label className="block font-medium">
                                Brightness
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="255"
                                value={brightness}
                                onChange={(e) =>
                                  setBrightness(Number(e.target.value))
                                }
                              />
                              <span className="text-xs">{brightness}</span>
                            </div>
                            <div className="flex-1 min-w-[180px]">
                              <label className="block font-medium">
                                Contrast
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="255"
                                value={contrast}
                                onChange={(e) =>
                                  setContrast(Number(e.target.value))
                                }
                              />
                              <span className="text-xs">{contrast}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
              {showHiddenState && (
                <>
                  <div className="flex gap-4 mt-6">
                    <Button
                      variant={activeTab === 'summary' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('summary')}
                    >
                      Summary
                    </Button>
                    <Button
                      variant={activeTab === 'pattern' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('pattern')}
                    >
                      Pattern EBC Settings
                    </Button>
                  </div>
                  {activeTab === 'summary' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {statsLoading ? (
                          <p>Loading statistics...</p>
                        ) : (
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr className="border-b">
                                <td className="py-3">Total panels tested</td>
                                <td className="py-3">
                                  {statsData
                                    ? statsData.total_panels_tested
                                    : 0}
                                </td>
                              </tr>
                              <tr className="border-b">
                                <td className="py-3">Total images captured</td>
                                <td className="py-3">
                                  {statsData
                                    ? statsData.total_images_captured
                                    : 0}
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
                      </CardContent>
                    </Card>
                  )}
                  {activeTab === 'pattern' && (
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Pattern EBC Settings</CardTitle>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleResetPatternEBC}
                        >
                          Reset Pattern EBC
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {testPatterns.map(({ name, src }) => (
                            <Collapsible
                              key={name}
                              className="border rounded-lg"
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-accent rounded-md">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={src}
                                      alt={name}
                                      className="w-8 h-8 object-contain"
                                    />
                                    <span className="font-medium">{name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="pointer-events-none"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent className="p-4">
                                <div className="flex gap-4 flex-wrap">
                                  {(
                                    [
                                      'exposure',
                                      'brightness',
                                      'contrast',
                                    ] as const
                                  ).map((key) => (
                                    <div
                                      key={key}
                                      className="flex-1 min-w-[120px]"
                                    >
                                      <label className="block font-medium capitalize">
                                        {key}
                                      </label>
                                      <input
                                        type="range"
                                        min="0"
                                        max="255"
                                        value={patternEBC[name][key]}
                                        onChange={(e) =>
                                          setPatternEBC((prev) => ({
                                            ...prev,
                                            [name]: {
                                              ...prev[name],
                                              [key]: Number(e.target.value),
                                            },
                                          }))
                                        }
                                      />
                                      <span className="text-xs">
                                        {patternEBC[name][key]}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default HomePage;
