import React from 'react';
import { useCamera, CameraResolution } from '../contexts/cameraContext';

interface CameraResolutionSelectorProps {
  className?: string;
}

const CameraResolutionSelector: React.FC<CameraResolutionSelectorProps> = ({
  className = '',
}) => {
  const {
    availableResolutions,
    selectedResolution,
    setResolution,
    cameraResolution,
    isLoading,
  } = useCamera();

  const handleResolutionChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedIndex = parseInt(event.target.value);
    const resolution = availableResolutions[selectedIndex];
    if (resolution) {
      await setResolution(resolution);
    }
  };
  console.log(availableResolutions, selectedResolution);
  const getCurrentResolutionIndex = () => {
    return availableResolutions.findIndex(
      (res) =>
        res.width === selectedResolution.width &&
        res.height === selectedResolution.height
    );
  };

  if (availableResolutions.length <= 1) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-medium">Resolution:</span>
        <span className="text-sm text-gray-600">
          {selectedResolution.label}
          {cameraResolution && (
            <span className="ml-2 text-xs">
              (Active: {cameraResolution.width}x{cameraResolution.height})
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="resolution-select" className="font-medium">
        Resolution:
      </label>
      <select
        id="resolution-select"
        value={getCurrentResolutionIndex()}
        onChange={handleResolutionChange}
        disabled={isLoading}
        className={`border border-gray-300 rounded px-2 py-1 text-sm ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {availableResolutions.map((resolution, index) => (
          <option
            key={`${resolution.width}x${resolution.height}`}
            value={index}
          >
            {resolution.label}
          </option>
        ))}
      </select>
      {cameraResolution && (
        <span className="text-xs text-gray-500">
          (Active: {cameraResolution.width}x{cameraResolution.height})
        </span>
      )}
    </div>
  );
};

export default CameraResolutionSelector;
