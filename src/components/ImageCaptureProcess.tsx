import { useState, useEffect } from 'react';
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
import { useCamera } from '../contexts/cameraContext';

interface ImageCaptureProcessProps {
  onComplete: (images: string[], totalToUpload: number) => void;
  onUploadProgress: (imageUrl: string | null, index: number) => void;
  ppid: string;
  isTestMode?: boolean;
  darkexposure: number;
  lightexposure: number;
  medexposure: number;
  focusDistance: number;
  configSelection?: 'auto' | 'manual' | null;
}

const patternClusterExposure = [
  { name: 'white_AAA', cluster: 1, exposure: 20 },
  { name: 'black&White_OOO', cluster: 1, exposure: 20 },
  { name: 'colorBars_JJJ', cluster: 1, exposure: 20 },
  { name: 'focus_KKK', cluster: 2, exposure: 60 },
  { name: 'gray75_HHH', cluster: 2, exposure: 60 },
  { name: 'green_FFF', cluster: 2, exposure: 60 },
  { name: 'cyan_CCC', cluster: 2, exposure: 60 },
  { name: 'gray50_DDD', cluster: 2, exposure: 60 },
  { name: 'red_EEE', cluster: 3, exposure: 100 },
  { name: 'grayVertical_III', cluster: 3, exposure: 100 },
  { name: '16BarGray_NNN', cluster: 3, exposure: 100 },
  { name: 'blue_GGG', cluster: 4, exposure: 140 },
  { name: 'crossHatch_MMM', cluster: 4, exposure: 140 },
  { name: 'blackWithWhiteBorder_LLL', cluster: 4, exposure: 140 },
  { name: 'black_BBB', cluster: 4, exposure: 140 },
];

const patternSrcMap = {
  white_AAA,
  black_BBB,
  cyan_CCC,
  gray50_DDD,
  red_EEE,
  green_FFF,
  blue_GGG,
  gray75_HHH,
  grayVertical_III,
  colorBars_JJJ,
  focus_KKK,
  blackWithWhiteBorder_LLL,
  crossHatch_MMM,
  '16BarGray_NNN': barGray_NNN,
  'black&White_OOO': blackWhite_OOO,
};

function ImageCaptureProcess({
  onComplete,
  onUploadProgress,
  ppid,
  isTestMode,
  focusDistance,
  configSelection = 'manual',
}: ImageCaptureProcessProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    setupCamera,
    isCameraReady,
    adjustCameraSettings,
    captureImage,
    videoRef,
    canvasRef,
  } = useCamera();

  const testPatterns = patternClusterExposure.map((p) => ({
    name: p.name,
    src: patternSrcMap[p.name],
    exposure: p.exposure,
    cluster: p.cluster,
  }));
  
  const testImagesCount = testPatterns.length;

  useEffect(() => {
    setupCamera();
  }, []);

  // Adjust camera settings for each pattern based on configSelection
  const adjustPatternCameraSettings = (pattern, configType) => {
    if (configType === 'auto') {
      adjustCameraSettings({
        exposureMode: 'continuous',
        focusMode: 'manual',
        focusDistance: focusDistance,
      });
    } else {
      adjustCameraSettings({
        exposureMode: 'manual',
        exposureCompensation: pattern.exposure,
        exposureTime: 50,
        focusMode: 'manual',
        focusDistance: focusDistance,
      });
    }
  };

  // Effect to handle camera settings when camera becomes ready
  useEffect(() => {
    if (isCameraReady && currentImageIndex < testPatterns.length) {
      adjustPatternCameraSettings(
        testPatterns[currentImageIndex],
        configSelection
      );
    }
  }, [isCameraReady, currentImageIndex, configSelection]);

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
          `Image capture process completed but has incorrect number of images: ${capturedImages.length} captured vs ${testImagesCount} expected`
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

  const uploadToDigitalOcean = async (imageData: string, index: number) => {
    if (index >= testImagesCount) {
      console.error('Attempted to upload image beyond test count');
      return null;
    }
    try {
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

  const processCurrentImage = () => {
    if (!isCameraReady) return;

    // Capture image using the context's method
    const imageData = captureImage();
    if (imageData) {
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
    }
  };

  useEffect(() => {
    if (isCameraReady && currentImageIndex < testImagesCount && !isCompleted) {
      // Give time to display the test pattern, then capture the webcam image
      const timer = setTimeout(() => {
        processCurrentImage();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentImageIndex, testImagesCount, isCameraReady, isCompleted]);

  const currentPattern = testPatterns[currentImageIndex];

  return (
    <div className="fixed cursor-none inset-0 bg-black flex flex-col items-center justify-center">
      {currentImageIndex < testImagesCount ? (
        <div className="w-full h-full cursor-none">
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
      <div className="aspect-video max-w-md hidden cursor-none">
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
