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

function ImageCaptureProcess({ patterns, onComplete }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mock images for testing
  // In a real app, you'd load these from somewhere or generate them
  const testImages = Array(15)
    .fill(null)
    .map((_, i) => `/test-pattern-${i + 1}.jpg`);

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
    if (currentImageIndex < testImages.length) {
      // Show the current image, then after a delay capture the webcam image
      const timer = setTimeout(() => {
        captureImage();
      }, 500); // 1 second to display each image

      return () => clearTimeout(timer);
    } else if (currentImageIndex === testImages.length) {
      // All images have been processed, save them
      if (capturedImages.length === testImages.length) {
        // Save captured images using Electron API
        if (window.electronAPI) {
          console.log('Captured:', capturedImages);

          window.electronAPI.saveTestImages(capturedImages);
          window.electronAPI.onTestImagesSaved(() => {
            onComplete();
          });
        } else {
          // For development without Electron
          console.log('Captured images:', capturedImages);
          onComplete();
        }
      }
    }
  }, [currentImageIndex, testImages.length, capturedImages.length, onComplete]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
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

      // Get the image data as a data URL at high quality
      const imageData = canvas.toDataURL('image/png', 1.0);

      // Add to captured images
      setCapturedImages((prev) => [...prev, imageData]);

      // Move to next image
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  // For development, show placeholder instead of missing images
  const currentImage =
    currentImageIndex < testImages.length ? testImages[currentImageIndex] : '';

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      {currentImageIndex < testImages.length ? (
        <div className="text-white text-center">
          <div className="bg-white w-screen h-screen flex items-center justify-center">
            {/* In development, use a placeholder div with the image name */}
            <div className="bg-gray-300 w-3/4 h-3/4 flex items-center justify-center">
              <span>Test Pattern Image {currentImageIndex + 1}</span>
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
            border: '2px solid green',
            backgroundColor: '#000',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ImageCaptureProcess;
