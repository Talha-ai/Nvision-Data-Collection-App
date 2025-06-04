import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  // Hide scrollbars when in fullscreen mode
  useEffect(() => {
    if (fullscreenImage) {
      // Hide scrollbars
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Restore scrollbars
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [fullscreenImage]);

  return (
    <div>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">PPID: {ppid}</span>
            </div>
            <CardTitle className="text-lg font-semibold text-center flex-1">
              Review Images
            </CardTitle>
            <Button
              variant="outline"
              onClick={onDiscard}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Discard Session
            </Button>
          </CardHeader>
          <CardContent>
            <h2 className="text-md font-medium mb-4">Review captured images</h2>
            {fullscreenImage ? (
              <div
                className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer z-50 w-screen h-screen"
                style={{ 
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  margin: 0,
                  padding: 0
                }}
                onDoubleClick={handleExitFullscreen}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <img
                    src={
                      capturedImages[parseInt(fullscreenImage.id.split('-')[1])]
                    }
                    alt={`Captured image ${
                      parseInt(fullscreenImage.id.split('-')[1]) + 1
                    }`}
                    className="max-h-full max-w-full object-contain"
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
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
                    <div className="h-40 w-full mb-1 overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={image}
                        alt={`Captured image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {ppid}_{testPatterns[index]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center gap-3 text-sm mt-4">
              <Button
                variant="outline"
                onClick={onRetake}
                className="border-primary text-primary w-full"
              >
                Retake images
              </Button>
              <Button onClick={onApprove} className="bg-primary w-full">
                Approve images
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReviewImagesPage;