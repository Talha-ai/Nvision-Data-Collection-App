import React from 'react';
import { useCamera, CameraDevice } from '../contexts/cameraContext';

interface CameraDeviceSelectorProps {
  className?: string;
}

const CameraDeviceSelector: React.FC<CameraDeviceSelectorProps> = ({
  className = '',
}) => {
  const { availableDevices, selectedDevice, setDevice, isLoading } =
    useCamera();

  const handleDeviceChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedIndex = parseInt(event.target.value);
    const device = availableDevices[selectedIndex];
    if (device) {
      await setDevice(device);
    }
  };

  const getCurrentDeviceIndex = () => {
    if (!selectedDevice) return 0;
    return availableDevices.findIndex(
      (device) => device.deviceId === selectedDevice.deviceId
    );
  };

  if (availableDevices.length <= 1) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="font-medium">Camera:</span>
        <span className="text-sm text-gray-600">
          {selectedDevice?.label || 'Default Camera'}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="device-select" className="font-medium">
        Camera:
      </label>
      <select
        id="device-select"
        value={getCurrentDeviceIndex()}
        onChange={handleDeviceChange}
        disabled={isLoading}
        className={`border border-gray-300 rounded px-2 py-1 text-sm ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {availableDevices.map((device, index) => (
          <option key={device.deviceId} value={index}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CameraDeviceSelector;
