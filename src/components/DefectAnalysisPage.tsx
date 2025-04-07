import { useState } from 'react';

interface DefectAnalysisPageProps {
  displayId: string;
  onSubmit: () => void;
}

function DefectAnalysisPage({ displayId, onSubmit }: DefectAnalysisPageProps) {
  const defectsList = ['Defect1', 'Defect2', 'Defect3', 'Defect4', 'Defect5'];
  const [selectedDefects, setSelectedDefects] = useState<string[]>([]);

  const toggleDefect = (defect: string) => {
    if (selectedDefects.includes(defect)) {
      setSelectedDefects(selectedDefects.filter((d) => d !== defect));
    } else {
      setSelectedDefects([...selectedDefects, defect]);
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nvision Data Collection app</h1>
        <div className="font-bold">Display {displayId}</div>
      </div>

      <div className="bg-white border rounded p-6 max-w-md mx-auto">
        <h2 className="font-bold mb-4">
          Which defects are present in this display?
        </h2>

        <div className="mb-6">
          {defectsList.map((defect, index) => (
            <div key={index} className="mb-2 flex items-center">
              <input
                type="checkbox"
                id={`defect-${index}`}
                checked={selectedDefects.includes(defect)}
                onChange={() => toggleDefect(defect)}
                className="mr-2"
              />
              <label htmlFor={`defect-${index}`}>{defect}</label>
            </div>
          ))}
        </div>

        <button
          onClick={onSubmit}
          className="bg-black text-white px-4 py-2 text-center w-full"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default DefectAnalysisPage;
