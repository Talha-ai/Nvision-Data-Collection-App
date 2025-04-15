import React, { useState, useEffect } from 'react';

interface DefectAnalysisPageProps {
  ppid: string;
  isTestMode: boolean;
  uploadedImageUrls: (string | null)[];
  onSubmit: () => void;
  onDiscard: () => void;
  uploadProgress: number;
  totalUploads: number;
  isUploading: boolean;
  failedUploadCount: number;
  onRetryUploads: () => void;
}

function DefectAnalysisPage({
  ppid,
  isTestMode,
  uploadedImageUrls,
  onSubmit,
  onDiscard,
  uploadProgress,
  totalUploads,
  isUploading,
  failedUploadCount,
  onRetryUploads,
}: DefectAnalysisPageProps) {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([1, 2, 3]);
  const [selectedFaults, setSelectedFaults] = useState<Record<number, string>>(
    {}
  );

  // State for handling submission status
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retryingUploads, setRetryingUploads] = useState(false);
  const [apiSubmissionFailed, setApiSubmissionFailed] = useState(false);
  const [retryingApiSubmission, setRetryingApiSubmission] = useState(false);
  const [showUploadFailure, setShowUploadFailure] = useState(false);
  // Track if we have upload failures
  const hasUploadFailures = !isUploading && failedUploadCount > 0;

  useEffect(() => {
    // Reset upload error when uploads are complete and no failures
    if (!isUploading && failedUploadCount === 0) {
      setRetryingUploads(false);
    }
  }, [isUploading, failedUploadCount]);

  useEffect(() => {
    // Fetch defect data
    const fetchDefects = async () => {
      try {
        const response = await fetch(
          'https://nvision.alemeno.com/data/defect/'
        );
        if (response.ok) {
          const data = await response.json();
          setDefects(data);
        } else {
          console.error('Failed to fetch defects');
        }
      } catch (error) {
        console.error('Error fetching defects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDefects();
  }, []);

  const addRow = () => {
    if (rows.length < 10) {
      // Limit number of rows
      setRows([...rows, Math.max(...rows) + 1]);
    }
  };

  const setFault = (rowId: number, value: string) => {
    setSelectedFaults({
      ...selectedFaults,
      [rowId]: value,
    });
  };

  // Handle retry uploads
  const handleRetryUploads = () => {
    setRetryingUploads(true);
    onRetryUploads();
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!showUploadFailure) {
      setShowUploadFailure(true); // This will make the error message appear
      return; // Stop here to show the error and "Retry uploading" button
    }

    // If recovering from API failure, handle retry
    if (apiSubmissionFailed) {
      setRetryingApiSubmission(true);
      await submitData();
      return;
    }

    // If there are upload failures, handle retry
    if (hasUploadFailures) {
      handleRetryUploads();
      return;
    }

    // Don't allow submission if uploads are still in progress
    if (isUploading) {
      return;
    }

    await submitData();
  };

  // Actual data submission function
  const submitData = async () => {
    setSubmitting(true);

    try {
      // throw new Error('api fialed');

      const panel_images = uploadedImageUrls
        .filter((url) => url !== null)
        .map((url, index) => ({
          panel: ppid,
          image_url: url,
          base_pattern: index + 1,
        }));

      // Get selected defect IDs (converting from string to number)
      const selectedDefectIds = Object.values(selectedFaults)
        .filter((id) => id)
        .map((id) => parseInt(id as string, 10));
      // Create the payload
      const payload = {
        ppid: ppid,
        defects: selectedDefectIds,
        panel_images: panel_images,
        test_type: isTestMode ? 'test-images' : 'production-images',
      };
      console.log('isTestMode:', isTestMode);
      console.log('Payload:', payload);
      
      const response = await fetch(
        'https://nvision.alemeno.com/data/display-panel/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setShowSuccessModal(true);
        setApiSubmissionFailed(false);
      } else {
        setApiSubmissionFailed(true);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      setApiSubmissionFailed(true);
    } finally {
      setSubmitting(false);
      setRetryingApiSubmission(false);
    }
  };

  const selectedCount = Object.keys(selectedFaults).filter((key) => {
    const val = selectedFaults[parseInt(key)];
    return val && val.length > 0 && val !== '16';
  }).length;

  if (loading) {
    return <div className="p-4 text-center">Loading defect data...</div>;
  }

  return (
    <div className="flex flex-col max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>PPID: {ppid}</div>
        <h1 className="text-2xl font-bold text-center">
          Nvision AI Data Collection App
        </h1>
        <button
          onClick={onDiscard}
          className="border border-green-500 text-green-500 rounded px-4 py-1 hover:bg-green-50"
          disabled={isUploading || submitting}
        >
          Discard Session
        </button>
      </div>

      <div className="mb-8 max-w-xl mx-auto w-full">
        <h2 className="text-xl font-medium mb-4">
          Which defects are present in this display?
        </h2>

        <table className="w-full border-collapse mb-4">
          <tbody>
            {rows.map((rowId) => (
              <tr key={rowId} className="border">
                <td className="border border-gray-300 p-3 w-12 text-center">
                  {rowId}
                </td>
                <td className="border border-gray-300 p-3">R-Fault Code</td>
                <td className="border border-gray-300 p-3">
                  <select
                    className="w-full p-2 border border-black rounded"
                    value={selectedFaults[rowId] || '16'}
                    onChange={(e) => setFault(rowId, e.target.value)}
                    disabled={isUploading || submitting}
                  >
                    {defects.map((defect, index) => (
                      <option key={index} value={defect.id}>
                        {defect.fault_code}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length < 10 && (
          <button
            onClick={addRow}
            className="text-green-700 flex items-center hover:text-green-800"
            disabled={isUploading || submitting}
          >
            <span className="text-lg mr-1">+</span> Add R-Fault Code row
          </button>
        )}

        <div className="flex flex-col mt-6">
          {isUploading && (
            <div className="mb-3 flex items-center text-blue-600 bg-blue-50 p-3 rounded-md">
              <svg
                className="animate-spin h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading... {uploadProgress}/{totalUploads} Images uploaded
            </div>
          )}

          {showUploadFailure && hasUploadFailures && !isUploading && (
            <div className="mb-3 flex items-center text-red-600 bg-red-50 p-3 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {failedUploadCount} uploads failed. Please check your internet
              connection and retry.
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              (submitting && !apiSubmissionFailed) ||
              retryingUploads ||
              (isUploading && !retryingUploads)
            }
            className={`${
              (submitting && !apiSubmissionFailed) || retryingUploads
                ? 'bg-gray-400'
                : apiSubmissionFailed
                ? 'bg-red-600 hover:bg-red-700'
                : hasUploadFailures && showUploadFailure
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white rounded px-6 py-3 transition-colors`}
          >
            {submitting && !retryingApiSubmission ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </div>
            ) : retryingApiSubmission ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Retrying submission...
              </div>
            ) : apiSubmissionFailed ? (
              `Try again with ${selectedCount} fault codes`
            ) : retryingUploads ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Reuploading...{' '}
                {uploadedImageUrls.filter((url) => url !== null).length}/
                {totalUploads} images uploaded
              </div>
            ) : hasUploadFailures && showUploadFailure ? (
              `Retry uploading ${failedUploadCount}/${totalUploads} failed images`
            ) : (
              `Submit with ${selectedCount} fault codes`
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md text-center shadow-xl">
            <div className="w-20 h-20 mx-auto mb-4 text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4">
              Data collection successful for PPID {ppid}
            </h2>
            <button
              onClick={onSubmit}
              className="bg-green-500 text-white px-8 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DefectAnalysisPage;
