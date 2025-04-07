import React, { useState } from 'react';

interface DefectAnalysisPageProps {
  ppid: string;
  onSubmit: () => void;
  onDiscard: () => void;
}

function DefectAnalysisPage({
  ppid,
  onSubmit,
  onDiscard,
}: DefectAnalysisPageProps) {
  const [rows, setRows] = useState([1, 2, 3]);
  const [selectedFaults, setSelectedFaults] = useState<Record<number, string>>(
    {}
  );

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

  const selectedCount = Object.keys(selectedFaults).filter(
    (key) =>
      selectedFaults[parseInt(key)] && selectedFaults[parseInt(key)].length > 0
  ).length;

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
                    <option value="fault1">Fault 1</option>
                    <option value="fault2">Fault 2</option>
                    <option value="fault3">Fault 3</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addRow} className="text-green-700 flex items-center">
          <span className="text-lg mr-1">+</span> Add R-Fault Code row
        </button>

        <button
          onClick={onSubmit}
          className="bg-green-600 text-white rounded px-6 py-3 mt-6"
        >
          Submit with {selectedCount} fault codes
        </button>
      </div>
    </div>
  );
}

export default DefectAnalysisPage;
