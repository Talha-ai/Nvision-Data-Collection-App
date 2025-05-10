// import { useEffect, useRef } from 'react';

// interface TestingPageProps {
//   displayId: number | string;
//   selectedPatterns: string[];
//   setSelectedPatterns: (patterns: string[]) => void;
//   onRunDefectChecker: () => void;
// }

// function TestingPage({
//   displayId,
//   selectedPatterns,
//   setSelectedPatterns,
//   onRunDefectChecker,
// }: TestingPageProps) {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const patternsList = [
//     'Pattern1',
//     'Pattern2',
//     'Pattern3',
//     'Pattern4',
//     'Pattern5',
//   ];

//   useEffect(() => {
//     let stream: MediaStream;

//     const setupCamera = async () => {
//       try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const videoDevices = devices.filter((d) => d.kind === 'videoinput');
//         const physicalCameras = videoDevices.filter(
//           (device) =>
//             !device.label.includes('OBS') && !device.label.includes('Virtual')
//         );

//         const deviceId =
//           physicalCameras.length > 0 ? physicalCameras[0].deviceId : undefined;

//         const constraints = {
//           video: {
//             deviceId: deviceId ? { exact: deviceId } : undefined,
//             width: { ideal: 1920 },
//             height: { ideal: 1080 },
//           },
//         };

//         stream = await navigator.mediaDevices.getUserMedia(constraints);
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (error) {
//         console.error('Error accessing camera:', error);
//       }
//     };

//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//       setupCamera();
//     }

//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const togglePattern = (pattern: string) => {
//     if (selectedPatterns.includes(pattern)) {
//       setSelectedPatterns(selectedPatterns.filter((p) => p !== pattern));
//     } else {
//       setSelectedPatterns([...selectedPatterns, pattern]);
//     }
//   };

//   return (
//     <div className="flex flex-col p-6 max-w-4xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Nvision Data Collection app</h1>
//         <div className="font-bold">Display {displayId}</div>
//       </div>

//       <div className="bg-pink-200 rounded w-full h-64 mb-6 overflow-hidden">
//         <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
//       </div>

//       <div className="border-t pt-4">
//         <h2 className="font-bold mb-4">Patterns</h2>
//         <div className="mb-6">
//           {patternsList.map((pattern, index) => (
//             <div key={index} className="mb-2 flex items-center">
//               <input
//                 type="checkbox"
//                 id={`pattern-${index}`}
//                 checked={selectedPatterns.includes(pattern)}
//                 onChange={() => togglePattern(pattern)}
//                 className="mr-2"
//               />
//               <label htmlFor={`pattern-${index}`}>{pattern}</label>
//             </div>
//           ))}
//         </div>

//         <button
//           onClick={onRunDefectChecker}
//           className="bg-black text-white px-4 py-2 text-center"
//         >
//           Run defect checker routine for selected patterns
//         </button>
//       </div>
//     </div>
//   );
// }

// export default TestingPage;
