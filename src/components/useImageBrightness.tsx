import { useEffect, useRef, useState } from 'react';

export function useImageBrightness(imageSrcMap: Record<string, string>) {
  const [brightnessMap, setBrightnessMap] = useState({});
  const canvasRef = useRef(document.createElement('canvas'));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const entries = Object.entries(imageSrcMap); 

    entries.forEach(([fileName, src]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; 
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const brightness = calculateBrightness(imageData);

        setBrightnessMap((prev) => ({
          ...prev,
          [fileName]: brightness,
        }));
      };
      img.src = src;
    });
  }, [imageSrcMap]);

  const calculateBrightness = (imageData) => {
    let sum = 0;
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += brightness;
    }
    return Math.round(sum / (data.length / 4));
  };

  return brightnessMap;
}
