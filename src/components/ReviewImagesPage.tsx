import React from 'react';
import { useState } from 'react';

interface ReviewImagesPageProps {
  ppid: string;
  capturedImages: string[];
  onApprove: () => void;
  onRetake: () => void;
  onDiscard: () => void;
}

const testPatterns = [
  'white_AAA.png',
  'black_BBB.png',
  'cyan_CCC.png',
  'gray50_DDD.png',
  'red_EEE.png',
  'green_FFF.png',
  'blue_GGG.png',
  'gray75_HHH.png',
  'grayVertical_III.png',
  'colorBars_JJJ.png',
  'focus_KKK.png',
  'blackWithWhiteBorder_LLL.png',
  'crossHatch_MMM.png',
  '16BarGray_NNN.png',
  'black&White_OOO.png',
];

function ReviewImagesPage({
  ppid,
  capturedImages,
  onApprove,
  onRetake,
  onDiscard,
}: ReviewImagesPageProps) {
  const [fullscreenImage, setFullscreenImage] = useState<{
    type: 'pattern' | 'captured';
    id: string;
  } | null>(null);

  // Function to toggle fullscreen for a pattern or captured image
  const handlePatternClick = (
    id: string,
    type: 'pattern' | 'captured' = 'pattern'
  ) => {
    if (fullscreenImage === null) {
      setFullscreenImage({ type, id });
      window.electronAPI.enableFullScreen();
    }
  };

  // Function to exit fullscreen
  const handleExitFullscreen = () => {
    setFullscreenImage(null);
    window.electronAPI.disableFullScreen();
  };

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
        <h2 className="text-md font-medium mb-4">Review captured images</h2>

        {fullscreenImage ? (
          // Fullscreen view
          <div
            className="fixed inset-0 bg-black flex flex-col items-center justify-between cursor-pointer"
            onDoubleClick={handleExitFullscreen}
          >
            {/* Main image display area */}
            <div className="flex-grow flex items-center justify-center w-full">
              <img
                src={capturedImages[parseInt(fullscreenImage.id.split('-')[1])]}
                alt={`Captured image ${
                  parseInt(fullscreenImage.id.split('-')[1]) + 1
                }`}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 px-3 py-2 rounded">
              Double-click to exit fullscreen
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {capturedImages.map((image, index) => (
              <div
                key={index}
                className="flex flex-col cursor-pointer"
                onClick={() => handlePatternClick(`captured-${index}`)}
              >
                <div className="h-40 w-full mb-1 overflow-hidden">
                  <img
                    src={image}
                    alt={`Captured image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm">
                  {ppid}_{testPatterns[index]}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center gap-3 text-sm">
          <button
            onClick={onRetake}
            className="border border-green-600 text-green-600 rounded w-full py-2"
          >
            Retake images
          </button>
          <button
            onClick={onApprove}
            className="bg-green-600 text-white rounded w-full py-2"
          >
            Approve images
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewImagesPage;
