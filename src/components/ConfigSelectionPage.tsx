import React, { useEffect, useState } from 'react';
import black_BBB from '../assets/black_BBB.bmp';
import cyan_CCC from '../assets/cyan_CCC.bmp';
import { useCamera } from '../contexts/cameraContext';

interface ConfigSelectionPageProps {
  ppid: string;
  onSelectConfig: (config: 'auto' | 'manual') => void;
  onDiscard: () => void;
  focusDistance: number;
}

const patternOrder = [
  { name: 'black_BBB', src: black_BBB },
  { name: 'cyan_CCC', src: cyan_CCC },
];

const manualExposureMap = {
  black_BBB: 140,
  cyan_CCC: 60,
};

const ConfigSelectionPage: React.FC<ConfigSelectionPageProps> = ({
  ppid,
  onSelectConfig,
  onDiscard,
  focusDistance,
}) => {
  const {
    setupCamera,
    isCameraReady,
    adjustCameraSettings,
    captureImage,
    videoRef,
    canvasRef,
  } = useCamera();

  const [autoImages, setAutoImages] = useState<(string | null)[]>([null, null]);
  const [manualImages, setManualImages] = useState<(string | null)[]>([
    null,
    null,
  ]);
  const [phase, setPhase] = useState<'auto' | 'manual' | 'done'>('auto');
  const [index, setIndex] = useState(0);
  const [showSelection, setShowSelection] = useState(false);

  // Start camera on mount
  useEffect(() => {
    setupCamera();
  }, []);

  // Main capture effect
  useEffect(() => {
    if (!isCameraReady) return;

    // If done, show selection and exit fullscreen
    if (phase === 'done') {
      setShowSelection(true);
      window.electronAPI?.disableFullScreen();
      return;
    }

    // If in auto/manual phase and index < 2, capture
    if ((phase === 'auto' || phase === 'manual') && index < 2) {
      window.electronAPI?.enableFullScreen();
      const pattern = patternOrder[index];

      if (phase === 'auto') {
        adjustCameraSettings({
          exposureMode: 'continuous',
          focusMode: 'manual',
          focusDistance,
        });
      } else {
        adjustCameraSettings({
          exposureMode: 'manual',
          exposureCompensation: manualExposureMap[pattern.name],
          exposureTime: 50,
          focusMode: 'manual',
          focusDistance,
        });
      }

      // Wait for settings to apply, then capture
      const timer = setTimeout(() => {
        const img = captureImage();
        if (img) {
          if (phase === 'auto') {
            setAutoImages((prev) => {
              const arr = [...prev];
              arr[index] = img;
              return arr;
            });
          } else {
            setManualImages((prev) => {
              const arr = [...prev];
              arr[index] = img;
              return arr;
            });
          }
        }

        // Move to next pattern or phase
        setTimeout(() => {
          if (index === 1) {
            if (phase === 'auto') {
              setPhase('manual');
              setIndex(0);
            } else {
              setPhase('done');
            }
          } else {
            setIndex((i) => i + 1);
          }
        }, 400);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCameraReady, phase, index, focusDistance]);

  // Show selection UI after all images are captured
  if (showSelection || phase === 'done') {
    return (
      <div className="flex flex-col max-w-6xl mx-auto p-4 mb-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="mr-2">PPID: {ppid}</span>
          </div>
          <h1 className="text-2xl font-bold text-center">
            Nvision AI Data Collection App
          </h1>
          <button
            onClick={onDiscard}
            className="border border-green-500 text-green-500 rounded-full px-4 py-1"
          >
            Discard Session
          </button>
        </div>

        <div className="max-w-xl mx-auto w-full">
          <h2 className="mb-2 text-center mt-10">
            Select the better quality image set
          </h2>
          <div className="flex gap-10 mb-8">
            {/* Auto column */}
            <div className="flex flex-col items-center border rounded p-4">
              <h3 className="mb-2 font-semibold">SET 1 (Auto)</h3>
              {patternOrder.map((pattern, idx) => (
                <div key={pattern.name} className="mb-2">
                  <div className="w-48 h-32 bg-gray-200 flex items-center justify-center mb-1">
                    {autoImages[idx] ? (
                      <img
                        src={autoImages[idx]!}
                        alt={`auto-${pattern.name}`}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-400">Capturing...</span>
                    )}
                  </div>
                  <div className="text-xs text-center">
                    {pattern.name.replace('_', ' ')}
                  </div>
                </div>
              ))}
              <button
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                disabled={autoImages.some((img) => !img) || phase !== 'done'}
                onClick={() => onSelectConfig('auto')}
              >
                Approve SET 1 (Auto)
              </button>
            </div>
            {/* Manual column */}
            <div className="flex flex-col items-center border rounded p-4">
              <h3 className="mb-2 font-semibold">SET 2 (Manual)</h3>
              {patternOrder.map((pattern, idx) => (
                <div key={pattern.name} className="mb-2">
                  <div className="w-48 h-32 bg-gray-200 flex items-center justify-center mb-1">
                    {manualImages[idx] ? (
                      <img
                        src={manualImages[idx]!}
                        alt={`manual-${pattern.name}`}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-400">Capturing...</span>
                    )}
                  </div>
                  <div className="text-xs text-center">
                    {pattern.name.replace('_', ' ')}
                  </div>
                </div>
              ))}
              <button
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                disabled={manualImages.some((img) => !img) || phase !== 'done'}
                onClick={() => onSelectConfig('manual')}
              >
                Approve SET 2 (Manual)
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'none' }}>
          <video ref={videoRef} autoPlay playsInline />
          <canvas ref={canvasRef} />
        </div>
      </div>
    );
  }

  // Show fullscreen pattern during capture
  if ((phase === 'auto' || phase === 'manual') && index < 2) {
    const pattern = patternOrder[index];
    return (
      <div className="fixed inset-0 cursor-none bg-black flex items-center justify-center z-50">
        <img
          src={pattern.src}
          alt={pattern.name}
          className="w-full h-full object-fill cursor-none"
        />
        <div style={{ display: 'none' }}>
          <video ref={videoRef} autoPlay playsInline />
          <canvas ref={canvasRef} />
        </div>
      </div>
    );
  }

  // Fallback (should not render)
  return null;
};

export default ConfigSelectionPage;
