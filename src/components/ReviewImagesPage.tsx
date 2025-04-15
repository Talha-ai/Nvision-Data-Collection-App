import React from 'react';

interface ReviewImagesPageProps {
  ppid: string;
  capturedImages: string[];
  onApprove: () => void;
  onRetake: () => void;
  onDiscard: () => void;
}

const testPatterns = [
  'white_AAA.png',
  'black_BBB.png',
  'cyan_CCC.png',
  'gray50_DDD.png',
  'red_EEE.png',
  'green_FFF.png',
  'blue_GGG.png',
  'gray75_HHH.png',
  'grayVertical_III.png',
  'colorBars_JJJ.png',
  'focus_KKK.png',
  'blackWithWhiteBorder_LLL.png',
  'crossHatch_MMM.png',
  '16BarGray_NNN.png',
  'black&White_OOO.png',
];

function ReviewImagesPage({
  ppid,
  capturedImages,
  onApprove,
  onRetake,
  onDiscard,
}: ReviewImagesPageProps) {
  return (
    <div className="flex flex-col max-w-6xl mx-auto p-4 mb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <span className="mr-2">PPID: {ppid}</span>
        </div>
        <h1 className="text-2xl font-bold text-center">
          Nvision AI Data Collection App
        </h1>
        <button
          onClick={onDiscard}
          className="border border-green-500 text-green-500 rounded-full px-4 py-1"
        >
          Discard Session
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full">
        <h2 className="text-md font-medium mb-4">Review captured images</h2>

        {/* <div className="grid grid-cols-2 gap-4 mb-8">
          {uploadedImageUrls.map((imageUrl, index) => {
            // Extract filename from the URL
            let filename = imageUrl ? imageUrl.split('/').pop() || '' : '';

            // Remove last underscore section before .png or .jpg etc
            const match = filename.match(/^(.*)_[^_]+(\.\w+)$/);
            if (match) {
              filename = match[1] + match[2]; // e.g., 123_ZQ6Y_white_AAA + .png
            }

            return (
              <div key={index} className="flex flex-col">
                <div className="h-40 w-full mb-1 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Captured image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm">
                  {filename || `Image ${index + 1}`}
                </span>
              </div>
            );
          })}
        </div> */}

        <div className="grid grid-cols-2 gap-4 mb-8">
          {capturedImages.map((image, index) => (
            <div key={index} className="flex flex-col">
              <div className="h-40 w-full mb-1 overflow-hidden">
                <img
                  src={image}
                  alt={`Captured image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-sm">
                {ppid}_{testPatterns[index]}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center gap-3 text-sm">
          <button
            onClick={onRetake}
            className="border border-green-600 text-green-600 rounded w-full py-2"
          >
            Retake images
          </button>
          <button
            onClick={onApprove}
            className="bg-green-600 text-white rounded w-full py-2"
          >
            Approve images
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewImagesPage;
