import { useEffect, useRef } from 'react';

interface HomePageProps {
  onStartNewSession: () => void;
}

function HomePage({ onStartNewSession }: HomePageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  return (
    <div className="flex flex-col items-center p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Nvision Data Collection app</h1>

      <div className="flex justify-between items-center w-full">
        <div className="bg-pink-200 rounded w-3/5 h-64 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={onStartNewSession}
          className="bg-black text-white px-6 py-4 text-center"
        >
          Start new testing session
        </button>
      </div>
    </div>
  );
}

export default HomePage;
