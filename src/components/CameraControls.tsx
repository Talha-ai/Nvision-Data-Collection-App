import React from 'react';
import { useCamera } from '../contexts/cameraContext';
import CameraDeviceSelector from './CameraDeviceSelector';
import CameraResolutionSelector from './CameraResolutionSelector';

interface CameraControlsProps {
  className?: string;
}

const CameraControls: React.FC<CameraControlsProps> = ({ className = '' }) => {
  const { isLoading } = useCamera();

  return (
    <div className={`space-y-3 ${className}`}>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Switching camera...</span>
        </div>
      )}
      <CameraDeviceSelector />
      <CameraResolutionSelector />
    </div>
  );
};

export default CameraControls;
