import { useState, useEffect, useRef } from 'react';
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

interface ImageCaptureProcessProps {
  onComplete: (images: string[], totalToUpload: number) => void;
  onUploadProgress: (imageUrl: string | null, index: number) => void;
  ppid: string;
  isTestMode?: boolean;
}

function ImageCaptureProcess({
  onComplete,
  onUploadProgress,
  ppid,
  isTestMode,
}: ImageCaptureProcessProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const testPatterns = [
    { name: 'white_AAA', src: white_AAA },
    { name: 'black_BBB', src: black_BBB },
    { name: 'cyan_CCC', src: cyan_CCC },
    { name: 'gray50_DDD', src: gray50_DDD },
    { name: 'red_EEE', src: red_EEE },
    { name: 'green_FFF', src: green_FFF },
    { name: 'blue_GGG', src: blue_GGG },
    { name: 'gray75_HHH', src: gray75_HHH },
    { name: 'grayVertical_III', src: grayVertical_III },
    { name: 'colorBars_JJJ', src: colorBars_JJJ },
    { name: 'focus_KKK', src: focus_KKK },
    { name: 'blackWithWhiteBorder_LLL', src: blackWithWhiteBorder_LLL },
    { name: 'crossHatch_MMM', src: crossHatch_MMM },
    { name: '16BarGray_NNN', src: barGray_NNN },
    { name: 'black&White_OOO', src: blackWhite_OOO },
  ];

  const testImagesCount = testPatterns.length;

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

  // Effect to check if we've completed capturing all images
  useEffect(() => {
    // Check if we've reached the end of the process and haven't called onComplete yet
    if (currentImageIndex >= testImagesCount && !isCompleted) {
      // Ensure we have the correct number of images
      if (capturedImages.length === testImagesCount) {
        setIsCompleted(true);
        onComplete(capturedImages.slice(0, testImagesCount), testImagesCount);
      } else {
        console.error(
          `Image capture process completed but has incorrect number of images: 
          ${capturedImages.length} captured vs ${testImagesCount} expected`
        );
      }
    }
  }, [
    currentImageIndex,
    capturedImages,
    testImagesCount,
    isCompleted,
    onComplete,
  ]);

  // Effect to handle the sequence of displaying patterns and capturing images
  useEffect(() => {
    if (isCameraReady && currentImageIndex < testImagesCount && !isCompleted) {
      // Give time to display the test pattern, then capture the webcam image
      const timer = setTimeout(() => {
        captureImage();
      }, 1000); // Increased delay to ensure test pattern is fully displayed

      return () => clearTimeout(timer);
    }
  }, [currentImageIndex, testImagesCount, isCameraReady, isCompleted]);

  const uploadToDigitalOcean = async (imageData: string, index: number) => {
    if (index >= testImagesCount) {
      console.error('Attempted to upload image beyond test count');
      return null;
    }

    try {
      // throw new Error('Uplaod fialed');
      const patternName = testPatterns[index].name;

      const imageUrl = await window.electronAPI.uploadImage({
        imageData,
        ppid,
        patternName,
        isTestMode,
      });

      console.log(`Successfully uploaded ${patternName}`);

      // Notify parent component about the completed upload
      onUploadProgress(imageUrl, index);

      return imageUrl;
    } catch (error) {
      console.error('Error uploading to DigitalOcean:', error);

      // Notify parent component about the failed upload
      onUploadProgress(null, index);

      return null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) {
      return;
    }

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

    // Store the current index to use in the background upload
    const imageIndex = currentImageIndex;

    setCapturedImages((prev) => {
      // Only add if we don't exceed the expected count
      if (prev.length < testImagesCount) {
        return [...prev, imageData];
      }
      return prev;
    });

    // Increment the image index
    setCurrentImageIndex((prev) => prev + 1);

    // Start the upload in the background
    setTimeout(() => {
      uploadToDigitalOcean(imageData, imageIndex).catch((error) =>
        console.error('Error during upload:', error)
      );
    }, 0);
  };

  // Get current test pattern filename
  const currentPattern = testPatterns[currentImageIndex];

  return (
    <div className="fixed cursor-none inset-0 bg-black flex flex-col items-center justify-center">
      {currentImageIndex < testImagesCount ? (
        <div className="w-full h-full">
          {/* Full screen test pattern image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {currentPattern && (
              <div className="relative w-full h-full">
                <img
                  src={currentPattern.src}
                  alt={`Test pattern ${currentImageIndex + 1}`}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    objectFit: 'fill',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-white text-2xl">Processing images...</div>
      )}

      {/* Hidden video element for camera capture */}
      <div className="aspect-video max-w-xl hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            border: isCameraReady ? '2px solid green' : '2px solid yellow',
          }}
          className="object-cover"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ImageCaptureProcess;
