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

interface HomePageProps {
  onStartDefectChecker: (ppid: string, isTestMode: boolean) => void;
}

function HomePage({ onStartDefectChecker }: HomePageProps) {
  const [ppid, setPpid] = useState<string>('');
  const [isTestMode, setIsTestMode] = useState(true);
  const [showHiddenState, setShowHiddenState] = useState<boolean>(false);
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('summary');
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

  const testPatterns = [
    'white_AAA.bmp',
    'black_BBB.bmp',
    'cyan_CCC.bmp',
    'gray50_DDD.bmp',
    'red_EEE.bmp',
    'green_FFF.bmp',
    'blue_GGG.bmp',
    'gray75_HHH.bmp',
    'grayVertical_III.bmp',
    'colorBars_JJJ.bmp',
    'focus_KKK.bmp',
    'blackWithWhiteBorder_LLL.jpg',
    'crossHatch_MMM.bmp',
    '16BarGray_NNN.bmp',
    'black&White_OOO.bmp',
  ];

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

  useEffect(() => {
    // Fetch defect data
    const fetchDefects = async () => {
      try {
        const response = await fetch(
          'https://nvision.alemeno.com/data/defect/'
        );
        if (response.ok) {
          const data = await response.json();
          setDefects(data);
        } else {
          console.error('Failed to fetch defects');
        }
      } catch (error) {
        console.error('Error fetching defects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDefects();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ppid.trim()) {
      onStartDefectChecker(ppid, isTestMode);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading defect data...</div>;
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
        onClick={() => setPpid('')}
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

      <div className="w-full bg-gray-200 h-64 relative mb-4">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-4/5 h-4/5 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-black"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-black"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-black"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-black"></div>
            </div>
          </div>
        </div>
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

      <div className="flex justify-between items-center text-sm w-full mb-10">
        <div className="flex items-center ">
          <div className="bg-gray-200 px-3 py-2 border border-gray-300 flex-shrink-0">
            Enter PPID
          </div>
          <input
            type="text"
            value={ppid}
            onChange={(e) => setPpid(e.target.value)}
            className="flex-grow border border-gray-300 px-3 py-2"
            placeholder="abcd123456789"
          />
        </div>
        <button
          onClick={handleSubmit}
          className={`${
            ppid ? 'bg-green-600' : 'bg-gray-400'
          } text-white px-6 py-2 rounded`}
          disabled={!ppid}
        >
          Start Defect Checker Routine
        </button>
      </div>

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
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Total panels tested</td>
                  <td className="py-3">0</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Total images captured</td>
                  <td className="py-3">0</td>
                </tr>
                {defects.map((defect, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3">
                      Images captured for {defect.defect_name}
                    </td>
                    <td className="py-3">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'pattern' && (
            <table className="w-full border-collapse">
              <tbody>
                {testPatterns.map((pattern, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 w-12 text-center">{index}</td>
                    <td className="py-3">
                      <div className="border border-black w-24">
                        <img src={patternImportMap[pattern]} alt={pattern} />
                      </div>
                    </td>
                    <td className="py-3">{pattern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
