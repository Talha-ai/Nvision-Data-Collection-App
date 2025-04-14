import React, { useState, useEffect } from 'react';

interface DefectAnalysisPageProps {
  ppid: string;
  uploadedImageUrls: string[];
  onSubmit: () => void;
  onDiscard: () => void;
}

function DefectAnalysisPage({
  ppid,
  uploadedImageUrls,
  onSubmit,
  onDiscard,
}: DefectAnalysisPageProps) {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([1, 2, 3]);
  const [selectedFaults, setSelectedFaults] = useState<Record<number, string>>(
    {}
  );

  // Add these states for modal handling
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Add this function to handle form submission
  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Create panel_images array with sequential base_pattern values
      const panel_images = uploadedImageUrls.map((url, index) => ({
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
      };

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
      } else {
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = Object.keys(selectedFaults).filter(
    (key) =>
      selectedFaults[parseInt(key)] && selectedFaults[parseInt(key)].length > 0
  ).length;

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
          className="border border-green-500 text-green-500 rounded px-4 py-1"
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
                    value={selectedFaults[rowId] || ''}
                    onChange={(e) => setFault(rowId, e.target.value)}
                  >
                    <option value="">Select fault code</option>
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
          <button onClick={addRow} className="text-green-700 flex items-center">
            <span className="text-lg mr-1">+</span> Add R-Fault Code row
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`${
            submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          } text-white rounded px-6 py-3 mt-6`}
        >
          {submitting
            ? 'Submitting...'
            : `Submit with ${selectedCount} fault codes`}
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md text-center">
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
              className="bg-green-500 text-white px-8 py-2 rounded-md"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-4 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4">
              Data collection failed for PPID {ppid}
            </h2>
            <button
              onClick={onDiscard}
              className="bg-green-500 text-white px-8 py-2 rounded-md"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DefectAnalysisPage;
