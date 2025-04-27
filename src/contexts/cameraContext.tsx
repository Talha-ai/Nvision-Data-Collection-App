import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

interface CameraContextType {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoTrackRef: React.RefObject<MediaStreamTrack>;
  isCameraReady: boolean;
  cameraResolution: { width: number; height: number } | null;
  setupCamera: () => Promise<void>;
  stopCamera: () => void;
  adjustCameraSettings: (settings: CameraSettings) => void;
  captureImage: () => string | null;
}

interface CameraSettings {
  exposureMode?: string;
  exposureTime?: number;
  exposureCompensation?: number;
  focusMode?: string;
  focusDistance?: number;
}

const CameraContext = createContext<CameraContextType | null>(null);

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraResolution, setCameraResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Setup camera stream
  const setupCamera = async () => {
    // Stop any existing stream first
    stopCamera();

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

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const videoTrack = stream.getVideoTracks()[0];
        videoTrackRef.current = videoTrack;

        const capabilities = videoTrack.getCapabilities();
        const advancedConstraints: any = {};

        if ('exposureMode' in capabilities) {
          advancedConstraints.exposureMode = 'manual';
        }

        if ('exposureCompensation' in capabilities) {
          advancedConstraints.exposureCompensation = 128;
        }

        if (Object.keys(advancedConstraints).length > 0) {
          try {
            await videoTrack.applyConstraints({
              advanced: [advancedConstraints],
            });
            console.log(
              'Applied initial camera settings:',
              advancedConstraints
            );
          } catch (error) {
            console.error('Error applying initial camera settings:', error);
          }
        }
        // Set up event handlers for video element
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };

        videoRef.current.onplaying = () => {
          setIsCameraReady(true);
          const settings = videoTrack.getSettings();
          setCameraResolution({
            width: settings.width || 0,
            height: settings.height || 0,
          });
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    videoTrackRef.current = null;
    setIsCameraReady(false);
  };

  // Adjust camera settings
  const adjustCameraSettings = async (settings: CameraSettings) => {
    const track = videoTrackRef.current;
    if (!track) return;

    try {
      const capabilities = track.getCapabilities();
      console.log('Camera capabilities:', capabilities);

      // Filter settings based on capabilities
      const applicableSettings: any = {};

      if ('exposureMode' in capabilities && settings.exposureMode) {
        applicableSettings.exposureMode = settings.exposureMode;
      }

      if ('exposureTime' in capabilities && settings.exposureTime) {
        applicableSettings.exposureTime = settings.exposureTime;
      }

      if (
        'exposureCompensation' in capabilities &&
        settings.exposureCompensation !== undefined
      ) {
        applicableSettings.exposureCompensation = settings.exposureCompensation;
      }

      if ('focusMode' in capabilities && settings.focusMode) {
        applicableSettings.focusMode = settings.focusMode;
      }

      if (
        'focusDistance' in capabilities &&
        settings.focusDistance !== undefined
      ) {
        applicableSettings.focusDistance = settings.focusDistance;
      }

      // Apply only the supported settings
      track.applyConstraints(applicableSettings);
      console.log('Applied camera settings:', applicableSettings);
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('After settings:', track.getSettings());
    } catch (error) {
      console.error('Error applying camera constraints:', error);
    }
  };

  // Capture image from video stream
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) {
      return null;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png', 1.0);
    }

    return null;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const value = {
    videoRef,
    canvasRef,
    videoTrackRef,
    isCameraReady,
    cameraResolution,
    setupCamera,
    stopCamera,
    adjustCameraSettings,
    captureImage,
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
      <div style={{ display: 'none' }}>
        <video ref={videoRef} autoPlay playsInline />
        <canvas ref={canvasRef} />
      </div>
    </CameraContext.Provider>
  );
};
