// useEffect(() => {
// if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
// navigator.mediaDevices
// .enumerateDevices()
// .then((devices) => {
// const videoDevices = devices.filter(
// (device) => device.kind === 'videoinput'
// );
// // console.log('Available video devices:', videoDevices);

// const physicalCameras = videoDevices.filter(
// (device) =>
// !device.label.includes('OBS') && !device.label.includes('Virtual')
// );

// // console.log('Physical cameras:', physicalCameras);
// const deviceId =
// physicalCameras.length > 0
// ? physicalCameras[0].deviceId
// : undefined;

// const constraints = {
// video: {
// deviceId: deviceId ? { exact: deviceId } : undefined,
// width: { ideal: 1920 },
// height: { ideal: 1080 },
// },
// };

// return navigator.mediaDevices.getUserMedia(constraints);
// })
// .then((stream) => {
// // const videoTracks = stream.getVideoTracks();
// // if (videoTracks.length > 0) {
// // console.log(`Using video device: ${videoTracks[0].label}`);
// // console.log('Track settings:', videoTracks[0].getSettings());
// // }
// // const capabilities = videoTracks[0].getCapabilities();
// // console.log('Supported capabilities:', capabilities);
// if (videoRef.current) {
// videoRef.current.srcObject = stream;
// // videoRef.current.onloadedmetadata = () => {
// // console.log('Video element dimensions after metadata loaded:', {
// // width: videoRef.current?.videoWidth,
// // height: videoRef.current?.videoHeight,
// // });
// // };
// }
// });
// }

// // Clean up function to stop the webcam stream when component unmounts
// return () => {
// if (videoRef.current && videoRef.current.srcObject) {
// // eslint-disable-next-line react-hooks/exhaustive-deps
// const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
// tracks.forEach((track) => track.stop());
// }
// };
// }, []);
