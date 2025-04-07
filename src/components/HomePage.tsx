import React, { useState, useRef, useEffect } from 'react';

interface HomePageProps {
  onStartDefectChecker: (ppid: string) => void;
}

function HomePage({ onStartDefectChecker }: HomePageProps) {
  const [ppid, setPpid] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('summary');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const defectTypes = Array.from({ length: 13 }, (_, i) => `Defect${i + 1}`);

  const patternData = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    filename: 'Red pattern.bmp',
  }));

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

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ppid.trim()) {
      onStartDefectChecker(ppid);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center my-4">
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
                {defectTypes.map((defect, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3">Images captured for {defect}</td>
                    <td className="py-3">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'pattern' && (
            <table className="w-full border-collapse">
              <tbody>
                {patternData.map((pattern) => (
                  <tr key={pattern.id} className="border-b">
                    <td className="py-3 w-12 text-center">{pattern.id}</td>
                    <td className="py-3">
                      <div className="bg-red-500 w-24 h-16"></div>
                    </td>
                    <td className="py-3">{pattern.filename}</td>
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
