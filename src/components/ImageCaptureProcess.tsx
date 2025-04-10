import { useState, useEffect, useRef } from 'react';
import AWS from 'aws-sdk/global';
import S3 from 'aws-sdk/clients/s3';

interface ImageCaptureProcessProps {
  onComplete: (images: string[]) => void;
  ppid: string;
  isTestMode?: boolean; // Flag to determine if these are test images or actual images
}

function ImageCaptureProcess({
  onComplete,
  ppid,
  isTestMode = true,
}: ImageCaptureProcessProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Array of test pattern images
  const testPatterns = [
    'white_AAA.bmp',
    'black_BBB.bmp',
    'cyan_CCC.bmp',
    'gray50_DDD.bmp',
    'red_EEE.bmp',
    'green_FFF.bmp',
    'blue_GGG.bmp',
    'gray75_HHH.bmp',
    'grayVertical_III.bmp',
    'colorBars_JJJ.bmp',
    'focus_KKK.bmp',
    'blackWithWhiteBorder_LLL.jpg',
    'crossHatch_MMM.bmp',
    '16BarGray_NNN.bmp',
    'black&White_OOO.bmp',
  ];

  // Total number of test patterns
  const testImagesCount = testPatterns.length;

  // Configure DigitalOcean Spaces
  const spacesEndpoint = new AWS.Endpoint('blr1.digitaloceanspaces.com');
  const s3 = new S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'DO801GNGMDNYAUGC8JYG',
    secretAccessKey: 'AtFgGOnOMcmtOg/3gky6XXyYXzneOZ3H89e3wclzFaw',
    region: 'blr1',
  });

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
    // Only proceed with image capture if camera is ready and not currently uploading
    if (isCameraReady && currentImageIndex < testImagesCount) {
      // Show the current test pattern, then after a delay capture the webcam image
      const timer = setTimeout(() => {
        captureImage();
      }, 500); // Increased delay to give time to display the test pattern

      return () => clearTimeout(timer);
    } else if (currentImageIndex === testImagesCount) {
      // All images have been processed, return them
      if (capturedImages.length === testImagesCount) {
        onComplete(capturedImages);
      }
    }
  }, [
    currentImageIndex,
    testImagesCount,
    capturedImages,
    onComplete,
    isCameraReady,
    isUploading,
  ]);

  // const uploadToDigitalOcean = async (imageData: string, index: number) => {
  //   try {
  //     setIsUploading(true);

  //     // Convert base64 string to a blob
  //     const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  //     const buff = Buffer.from(base64Data, 'base64');

  //     const uploadPath = isTestMode ? 'test-images' : 'production-images';
  //     const timestamp = Date.now();
  //     const patternName = testPatterns[index].replace(/\.(bmp|jpg|png)/i, '');
  //     const fileName = `${uploadPath}/${ppid}_${patternName}_${timestamp}.png`;

  //     const params = {
  //       Bucket: 'rlogic-images-data',
  //       Key: fileName,
  //       Body: buff,
  //       ContentEncoding: 'base64',
  //       ContentType: 'image/png',
  //       ACL: 'public-read',
  //     };

  //     // Upload to DigitalOcean Spaces
  //     await s3.upload(params).promise();
  //     console.log(`Successfully uploaded ${fileName}`);

  //     // After 2 seconds, move to the next image
  //     setTimeout(() => {
  //       setIsUploading(false);
  //       setCurrentImageIndex((prev) => prev + 1);
  //     }, 2000);

  //     // Return the public URL of the uploaded file
  //     return `https://rlogic-images-data.blr1.digitaloceanspaces.com/${fileName}`;
  //   } catch (error) {
  //     console.error('Error uploading to DigitalOcean:', error);
  //     setIsUploading(false);
  //     return null;
  //   }
  // };

  const captureImage = async () => {
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
      setCurrentImageIndex((prev) => prev + 1);

      // Upload to DigitalOcean
      // await uploadToDigitalOcean(imageData, currentImageIndex);
    }
  };

  // Get current test pattern filename
  const currentPattern =
    currentImageIndex < testImagesCount
      ? testPatterns[currentImageIndex]
      : null;

  return (
    <div className="fixed cursor-none inset-0 bg-black flex flex-col items-center justify-center">
      {currentImageIndex < testImagesCount ? (
        <div className="w-full h-full">
          {/* Full screen test pattern image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {currentPattern && (
              <div className="relative w-full h-full">
                <img
                  src={`/test-patterns/${currentPattern}`}
                  alt={`Test pattern ${currentImageIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Status indicator - only visible when uploading */}
                {isUploading && (
                  <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white px-3 py-1 m-4 rounded">
                    Uploading {currentImageIndex + 1}/{testImagesCount}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-white text-2xl">Processing images...</div>
      )}

      {/* Hidden video element for camera capture */}
      <div className="hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '320px',
            height: '240px',
            border: isCameraReady ? '2px solid green' : '2px solid yellow',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ImageCaptureProcess;
