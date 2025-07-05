import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

export interface CameraResolution {
  width: number;
  height: number;
  label: string;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
  groupId: string;
}

interface CameraContextType {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoTrackRef: React.RefObject<MediaStreamTrack>;
  isCameraReady: boolean;
  isLoading: boolean;
  cameraResolution: { width: number; height: number } | null;
  availableResolutions: CameraResolution[];
  selectedResolution: CameraResolution;
  availableDevices: CameraDevice[];
  selectedDevice: CameraDevice | null;
  setupCamera: (
    resolution?: CameraResolution,
    deviceId?: string
  ) => Promise<void>;
  stopCamera: () => void;
  adjustCameraSettings: (settings: CameraSettings) => void;
  captureImage: () => string | null;
  setResolution: (resolution: CameraResolution) => Promise<void>;
  setDevice: (device: CameraDevice) => Promise<void>;
  getAvailableResolutions: (deviceId?: string) => Promise<CameraResolution[]>;
  getAvailableDevices: () => Promise<CameraDevice[]>;
}

interface CameraSettings {
  exposureMode?: string;
  exposureTime?: number;
  exposureCompensation?: number;
  focusMode?: string;
  brightness?: string;
  contrast?: string;
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

// Common resolution presets
const RESOLUTION_PRESETS: CameraResolution[] = [
  { width: 1920, height: 1080, label: 'Full HD (1920x1080)' },
  { width: 3840, height: 2160, label: '4K UHD (3840x2160)' },
  { width: 2560, height: 1440, label: 'QHD (2560x1440)' },
  { width: 1280, height: 720, label: 'HD (1280x720)' },
];

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraResolution, setCameraResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [availableResolutions, setAvailableResolutions] = useState<
    CameraResolution[]
  >([]);
  const [selectedResolution, setSelectedResolution] =
    useState<CameraResolution>(() => {
      // Try to load saved resolution from localStorage
      const savedResolution = localStorage.getItem('cameraResolution');
      if (savedResolution) {
        try {
          const parsed = JSON.parse(savedResolution);
          // Validate the parsed resolution has required properties
          if (parsed.width && parsed.height && parsed.label) {
            return parsed;
          }
        } catch (error) {
          console.log('Failed to parse saved resolution, using default');
        }
      }
      return RESOLUTION_PRESETS[0]; // Default to Full HD
    });

  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<CameraDevice | null>(
    () => {
      // Try to load saved device from localStorage
      const savedDevice = localStorage.getItem('cameraDevice');
      if (savedDevice) {
        try {
          const parsed = JSON.parse(savedDevice);
          if (parsed.deviceId && parsed.label) {
            return parsed;
          }
        } catch (error) {
          console.log('Failed to parse saved device, will auto-select');
        }
      }
      return null; // Will be set when devices are loaded
    }
  );

  // Cache for device resolutions to avoid retesting
  const deviceResolutionCache = useRef<Map<string, CameraResolution[]>>(
    new Map()
  );

  // Get available camera devices
  const getAvailableDevices = async (): Promise<CameraDevice[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      const physicalCameras = videoDevices.filter(
        (device) =>
          !device.label.includes('OBS') && !device.label.includes('Virtual')
      );

      return physicalCameras.map((device) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        groupId: device.groupId || '',
      }));
    } catch (error) {
      console.error('Error getting available devices:', error);
      return [];
    }
  };

  // Test a single resolution with timeout (improved)
  const testResolution = async (
    deviceId: string,
    preset: CameraResolution,
    timeoutMs: number = 3000
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log(
          `Resolution ${preset.label} test timed out for device ${deviceId}`
        );
        resolve(false);
      }, timeoutMs);

      const testConstraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { exact: preset.width },
          height: { exact: preset.height },
        },
      };

      navigator.mediaDevices
        .getUserMedia(testConstraints)
        .then((testStream) => {
          clearTimeout(timeout);
          const track = testStream.getVideoTracks()[0];
          const settings = track.getSettings();

          console.log(
            `Testing ${preset.label} for device ${deviceId}: got ${settings.width}x${settings.height}`
          );

          // More flexible resolution matching - allow for small variations
          const widthMatch =
            Math.abs((settings.width || 0) - preset.width) <= 10;
          const heightMatch =
            Math.abs((settings.height || 0) - preset.height) <= 10;
          const isSupported = widthMatch && heightMatch;

          // Clean up test stream immediately
          testStream.getTracks().forEach((track) => track.stop());

          console.log(
            `Resolution ${preset.label} ${
              isSupported ? 'SUPPORTED' : 'NOT SUPPORTED'
            } for device ${deviceId}`
          );
          resolve(isSupported);
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.log(
            `Resolution ${preset.label} failed for device ${deviceId}:`,
            error.message
          );
          resolve(false);
        });
    });
  };

  // Get available camera resolutions for a specific device (optimized with caching)
  const getAvailableResolutions = async (
    deviceId?: string
  ): Promise<CameraResolution[]> => {
    try {
      const targetDeviceId = deviceId || selectedDevice?.deviceId;
      if (!targetDeviceId) {
        // If no device specified, get devices first
        const devices = await getAvailableDevices();
        if (devices.length === 0) return [RESOLUTION_PRESETS[0]];
        return getAvailableResolutions(devices[0].deviceId);
      }

      // Check cache first for faster switching (but allow bypassing for debugging)
      const cached = deviceResolutionCache.current.get(targetDeviceId);
      const forceRetest = false; // Set to true for debugging resolution issues

      if (cached && !forceRetest) {
        console.log(
          `Using cached resolutions for device ${targetDeviceId}:`,
          cached
        );
        return cached;
      }

      if (forceRetest && cached) {
        console.log(
          `Force retesting resolutions for device ${targetDeviceId} (cache bypassed)`
        );
      }

      console.log(`Testing resolutions for device ${targetDeviceId}...`);

      // Test resolutions in parallel with adequate timeout for reliable detection
      const resolutionTests = RESOLUTION_PRESETS.map((preset) =>
        testResolution(targetDeviceId, preset, 2500).then((isSupported) => ({
          preset,
          isSupported,
        }))
      );

      const results = await Promise.all(resolutionTests);
      const supportedResolutions = results
        .filter((result) => result.isSupported)
        .map((result) => result.preset);

      const finalResolutions =
        supportedResolutions.length > 0
          ? supportedResolutions
          : [RESOLUTION_PRESETS[0]];

      // Cache the results for faster future switching
      deviceResolutionCache.current.set(targetDeviceId, finalResolutions);

      console.log(
        `Found ${finalResolutions.length} supported resolutions for device ${targetDeviceId}`
      );

      return finalResolutions;
    } catch (error) {
      console.error('Error getting available resolutions:', error);
      return [RESOLUTION_PRESETS[0]];
    }
  };

  // Setup camera stream
  const setupCamera = async (
    resolution?: CameraResolution,
    deviceId?: string
  ) => {
    // Stop any existing stream first
    stopCamera();
    setIsLoading(true);
    setIsCameraReady(false);

    const targetResolution = resolution || selectedResolution;
    const targetDeviceId = deviceId || selectedDevice?.deviceId;

    try {
      // If no device is selected, get available devices and select the first one
      if (!targetDeviceId) {
        const devices = await getAvailableDevices();
        if (devices.length > 0) {
          setSelectedDevice(devices[0]);
          setAvailableDevices(devices);
          return setupCamera(targetResolution, devices[0].deviceId);
        } else {
          throw new Error('No camera devices found');
        }
      }

      const constraints = {
        video: {
          deviceId: { exact: targetDeviceId },
          width: { ideal: targetResolution.width },
          height: { ideal: targetResolution.height },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const videoTrack = stream.getVideoTracks()[0];
        videoTrackRef.current = videoTrack;

        // const capabilities = videoTrack.getCapabilities();
        // const advancedConstraints: any = {};

        // if ('exposureMode' in capabilities) {
        //   advancedConstraints.exposureMode = 'manual';
        // }

        // if (Object.keys(advancedConstraints).length > 0) {
        //   try {
        //     await videoTrack.applyConstraints({
        //       advanced: [advancedConstraints],
        //     });
        //     console.log(
        //       'Applied initial camera settings:',
        //       advancedConstraints
        //     );
        //   } catch (error) {
        //     console.error('Error applying initial camera settings:', error);
        //   }
        // }

        // Set up event handlers for video element
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };

        videoRef.current.onplaying = () => {
          setIsCameraReady(true);
          setIsLoading(false);
          const settings = videoTrack.getSettings();
          const actualResolution = {
            width: settings.width || 0,
            height: settings.height || 0,
          };

          setCameraResolution(actualResolution);

          // Update selectedResolution to match what the camera is actually providing
          const matchingPreset = RESOLUTION_PRESETS.find(
            (preset) =>
              preset.width === actualResolution.width &&
              preset.height === actualResolution.height
          );

          if (matchingPreset) {
            // Check if we need to update the selected resolution
            if (
              !selectedResolution ||
              selectedResolution.width !== actualResolution.width ||
              selectedResolution.height !== actualResolution.height
            ) {
              console.log(
                `Updating selectedResolution to match actual camera resolution: ${matchingPreset.label} (${actualResolution.width}x${actualResolution.height})`
              );
              setSelectedResolution(matchingPreset);
              localStorage.setItem(
                'cameraResolution',
                JSON.stringify(matchingPreset)
              );
            }
          } else {
            // If actual resolution doesn't match any preset, create a custom one
            const customResolution: CameraResolution = {
              width: actualResolution.width,
              height: actualResolution.height,
              label: `Custom (${actualResolution.width}x${actualResolution.height})`,
            };

            console.log(
              `Camera is using non-standard resolution: ${customResolution.label}`
            );
            setSelectedResolution(customResolution);
            localStorage.setItem(
              'cameraResolution',
              JSON.stringify(customResolution)
            );
          }
        };

        videoRef.current.onerror = () => {
          setIsLoading(false);
          setIsCameraReady(false);
          console.error('Video element error');
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsLoading(false);
      setIsCameraReady(false);
    }
  };

  // Set resolution and restart camera
  const setResolution = async (resolution: CameraResolution) => {
    try {
      setSelectedResolution(resolution);
      // Save to localStorage for persistence
      localStorage.setItem('cameraResolution', JSON.stringify(resolution));
      await setupCamera(resolution);
    } catch (error) {
      console.error('Error setting resolution:', error);
      setIsLoading(false);
    }
  };

  // Set device and restart camera
  const setDevice = async (device: CameraDevice) => {
    try {
      setIsLoading(true);
      setSelectedDevice(device);
      // Save to localStorage for persistence
      localStorage.setItem('cameraDevice', JSON.stringify(device));

      // Get resolutions for the new device (uses cache if available for faster switching)
      const resolutions = await getAvailableResolutions(device.deviceId);
      setAvailableResolutions(resolutions);

      // If current resolution is not supported by new device, switch to first available
      const isCurrentResolutionSupported = resolutions.some(
        (res) =>
          res.width === selectedResolution.width &&
          res.height === selectedResolution.height
      );

      const targetResolution = isCurrentResolutionSupported
        ? selectedResolution
        : resolutions[0];

      if (!isCurrentResolutionSupported && resolutions.length > 0) {
        setSelectedResolution(targetResolution);
        localStorage.setItem(
          'cameraResolution',
          JSON.stringify(targetResolution)
        );
      }

      // Start camera setup immediately with target resolution
      await setupCamera(targetResolution, device.deviceId);
    } catch (error) {
      console.error('Error setting device:', error);
      setIsLoading(false);
    }
  };

  // Initialize devices and resolutions on mount
  useEffect(() => {
    const initCamera = async () => {
      const devices = await getAvailableDevices();
      setAvailableDevices(devices);

      if (devices.length > 0) {
        // If we have a saved device, verify it still exists
        let deviceToUse = selectedDevice;
        if (selectedDevice) {
          const deviceExists = devices.some(
            (d) => d.deviceId === selectedDevice.deviceId
          );
          if (!deviceExists) {
            deviceToUse = devices[0];
            setSelectedDevice(deviceToUse);
            localStorage.setItem('cameraDevice', JSON.stringify(deviceToUse));
          }
        } else {
          deviceToUse = devices[0];
          setSelectedDevice(deviceToUse);
          localStorage.setItem('cameraDevice', JSON.stringify(deviceToUse));
        }

        // Get resolutions for the selected device
        const resolutions = await getAvailableResolutions(deviceToUse.deviceId);
        setAvailableResolutions(resolutions);
      }
    };
    initCamera();
  }, []);

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
      if ('brightness' in capabilities && settings.brightness !== undefined) {
        applicableSettings.brightness = settings.brightness;
      }
      if ('contrast' in capabilities && settings.contrast !== undefined) {
        applicableSettings.contrast = settings.contrast;
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
    isLoading,
    cameraResolution,
    availableResolutions,
    selectedResolution,
    availableDevices,
    selectedDevice,
    setupCamera,
    stopCamera,
    adjustCameraSettings,
    captureImage,
    setResolution,
    setDevice,
    getAvailableResolutions,
    getAvailableDevices,
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
      <div style={{ display: 'none' }}>
        {/* <video ref={videoRef} autoPlay playsInline /> */}
        <canvas ref={canvasRef} />
      </div>
    </CameraContext.Provider>
  );
};
