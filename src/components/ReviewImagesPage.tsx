import React from 'react';

interface ReviewImagesPageProps {
  ppid: string;
  capturedImages: string[];
  onApprove: () => void;
  onRetake: () => void;
  onDiscard: () => void;
}

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
