// components/CustomTitlebar.tsx
import React from 'react';

interface CustomTitlebarProps {
  onMinimize: () => void;
  onClose: () => void;
}

const CustomTitlebar: React.FC<CustomTitlebarProps> = ({
  onMinimize,
  onClose,
}) => {
  return (
    <div className="custom-titlebar">
      <div className="titlebar-drag-region">
        <span className="app-title">Nvision Data Collection App</span>
      </div>
      <div className="titlebar-controls">
        <button className="titlebar-button" onClick={onMinimize}>
          <span>&#8212;</span>
        </button>
        <button className="titlebar-button close-button" onClick={onClose}>
          <span>&#10005;</span>
        </button>
      </div>
      <style jsx>{`
        .custom-titlebar {
          height: 32px;
          background-color: #2b2b2b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          -webkit-app-region: drag;
          user-select: none;
        }

        .titlebar-drag-region {
          flex-grow: 1;
          padding-left: 12px;
        }

        .app-title {
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
        }

        .titlebar-controls {
          display: flex;
          -webkit-app-region: no-drag;
        }

        .titlebar-button {
          width: 46px;
          height: 32px;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 10px;
          outline: none;
          cursor: pointer;
        }

        .titlebar-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .close-button:hover {
          background-color: #e81123;
        }
      `}</style>
    </div>
  );
};

export default CustomTitlebar;
