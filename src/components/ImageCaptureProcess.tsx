import { useState, useEffect, useRef } from 'react';

// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI?: {
      saveTestImages: (images: string[]) => void;
      onTestImagesSaved: (callback: () => void) => void;
    };
  }
}

interface ImageCaptureProcessProps {
  onComplete: (images: string[]) => void;
}

function ImageCaptureProcess({ onComplete }: ImageCaptureProcessProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // We'll use 15 test images as shown in the screenshots
  const testImagesCount = 15;

  useEffect(() => {
    let stream: MediaStream;

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

          // Add event listener to check when video is actually playing
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };

          videoRef.current.onplaying = () => {
            setIsCameraReady(true);
          };
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

  useEffect(() => {
    // Only proceed with image capture if camera is ready
    if (isCameraReady && currentImageIndex < testImagesCount) {
      // Show the current test pattern, then after a delay capture the webcam image
      const timer = setTimeout(() => {
        captureImage();
      }, 500);

      return () => clearTimeout(timer);
    } else if (currentImageIndex === testImagesCount) {
      // All images have been processed, return them
      if (capturedImages.length === testImagesCount) {
        // If using Electron, save via its API
        if (window.electronAPI) {
          console.log('Captured:', capturedImages);

          window.electronAPI.saveTestImages(capturedImages);
          window.electronAPI.onTestImagesSaved(() => {
            onComplete(capturedImages);
          });
        } else {
          // For development without Electron
          console.log('Captured images:', capturedImages);
          onComplete(capturedImages);
        }
      }
    }
  }, [
    currentImageIndex,
    testImagesCount,
    capturedImages,
    onComplete,
    isCameraReady,
  ]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Get the actual video dimensions
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      // Set canvas dimensions to match video's actual dimensions
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw the current video frame to the canvas
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }

      // Get the image data as a data URL
      const imageData = canvas.toDataURL('image/png', 1.0);

      // Add to captured images
      setCapturedImages((prev) => [...prev, imageData]);

      // Move to next image
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      {currentImageIndex < testImagesCount ? (
        <div className="text-white text-center w-full h-full">
          <div className="bg-white w-full h-full flex items-center justify-center">
            <div className="bg-gray-300 w-full h-full flex items-center justify-center">
              <span className="absolute z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                {isCameraReady
                  ? `Test Pattern Image ${currentImageIndex + 1}`
                  : 'Waiting for camera...'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white text-2xl">Processing images...</div>
      )}

      <div className="absolute bottom-0 right-0 p-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '320px',
            height: '240px',
            border: isCameraReady ? '2px solid green' : '2px solid yellow',
            backgroundColor: '#000',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ImageCaptureProcess;
