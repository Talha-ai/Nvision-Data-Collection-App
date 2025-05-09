import { useState, useEffect, useRef } from 'react';

// This component analyzes the brightness of images
export default function ImageBrightnessAnalyzer() {
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileInput, setFileInput] = useState(null);
  const canvasRef = useRef(null);

  // Function to calculate average brightness (0-255)
  const calculateBrightness = (imageData) => {
    let sum = 0;
    const data = imageData.data;

    // Calculate brightness for each pixel using the luminance formula: 0.299R + 0.587G + 0.114B
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Standard luminance formula
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += brightness;
    }

    // Return average brightness (rounded to nearest integer)
    return Math.round(sum / (data.length / 4));
  };

  // Handler for when files are selected
  const handleFilesSelected = (e) => {
    setFileInput(e.target.files);
  };

  // Function to analyze selected images
  const analyzeImages = () => {
    if (!fileInput || fileInput.length === 0) {
      alert('Please select at least one image to analyze');
      return;
    }

    setIsAnalyzing(true);
    setResults([]);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const fileArray = Array.from(fileInput);

    // Process each file
    const processFile = (index) => {
      if (index >= fileArray.length) {
        setIsAnalyzing(false);
        return;
      }

      const file = fileArray[index];
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Set canvas dimensions to image size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image to canvas
          ctx.drawImage(img, 0, 0);

          // Get image data for analysis
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Calculate brightness
          const brightness = calculateBrightness(imageData);

          // Add to results
          setResults((prev) => [
            ...prev,
            {
              name: file.name,
              brightness,
            },
          ]);

          // Process next file
          processFile(index + 1);
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    };

    // Start processing
    processFile(0);
  };

  // Sort results by brightness
  const sortedResults = [...results].sort(
    (a, b) => a.brightness - b.brightness
  );

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Image Brightness Analyzer</h1>

      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          className="mb-2 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

        <button
          onClick={analyzeImages}
          disabled={isAnalyzing}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Images'}
        </button>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {results.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-medium mb-2">Sorted by Brightness (0-255):</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left">Image</th>
                  <th className="text-right">Brightness</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-1">{result.name}</td>
                    <td className="text-right py-1">{result.brightness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
