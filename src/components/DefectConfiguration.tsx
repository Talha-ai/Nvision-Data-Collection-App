import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, Save } from 'lucide-react';

const DefectConfiguration = ({ onDefectsSelected, selectedDefects = [] }) => {
  const [checkedDefects, setCheckedDefects] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Complete defect list with mapping to keys
  const defectsList = [
    {
      id: 1,
      name: 'Abnormal Display',
      faultCode: 'VID - Abnormal Display',
      key: 'def_abnormal_display',
    },
    {
      id: 2,
      name: 'Horizontal Line',
      faultCode: 'VID - Horizontal Line',
      key: 'def_horizontal_line',
    },
    {
      id: 3,
      name: 'Horizontal Band',
      faultCode: 'VID - Horizontal Band',
      key: 'def_horizontal_band',
    },
    {
      id: 4,
      name: 'Vertical Line',
      faultCode: 'VID - Vertical Line',
      key: 'def_vertical_line',
    },
    {
      id: 5,
      name: 'Vertical Band',
      faultCode: 'VID - Vertical Band',
      key: 'def_vertical_band',
    },
    {
      id: 6,
      name: 'Particles',
      faultCode: 'VID - Particles',
      key: 'def_particles',
    },
    {
      id: 7,
      name: 'White Patch',
      faultCode: 'CID - White Patch',
      key: 'def_white_patches',
    },
    {
      id: 8,
      name: 'Polariser Scratches / Dent',
      faultCode: 'CID - Polariser Scratches / Dent',
      key: 'def_polariser_scratches',
    },
    {
      id: 9,
      name: 'Light Leakage',
      faultCode: 'VID - Light Leakage',
      key: 'def_light_leakage',
    },
    { id: 10, name: 'Mura', faultCode: 'VID - Mura', key: 'def_mura' },
    {
      id: 11,
      name: 'Incoming Border Patch',
      faultCode: 'VID - Incoming Border Patch',
      key: 'def_incoming_border_patch',
    },
    {
      id: 12,
      name: 'Pixel Bright Dot',
      faultCode: 'VID - Pixel Bright Dot',
      key: 'def_pixel_bright_dot',
    },
    {
      id: 13,
      name: 'Incoming Galaxy',
      faultCode: 'BER - Incoming Galaxy',
      key: 'def_incoming_galaxy',
    },
    { id: 14, name: 'Led Off', faultCode: 'VID - Led Off', key: 'def_led_off' },
    {
      id: 15,
      name: 'Bleeding',
      faultCode: 'VID - Bleeding',
      key: 'def_bleeding',
    },
    {
      id: 16,
      name: 'No Trouble Found',
      faultCode: 'NTF - No Trouble Found',
      key: 'def_no_trouble_found',
    },
    {
      id: 17,
      name: 'Other Defects',
      faultCode: 'Other Defects',
      key: 'def_other_defects',
    },
  ];

  // Load saved defects from localStorage on component mount
  useEffect(() => {
    try {
      const savedDefects = localStorage.getItem('selectedDefects');
      if (savedDefects) {
        const parsedDefects = JSON.parse(savedDefects);
        setCheckedDefects(new Set(parsedDefects));
        if (selectedDefects.length > 0) {
          setCheckedDefects(new Set(selectedDefects));
        }
      } else if (selectedDefects.length > 0) {
        setCheckedDefects(new Set(selectedDefects));
        // } else {
        //   // Default selection - commonly used defects
        //   const defaultDefects = [
        //     'def_horizontal_band',
        //     'def_white_patches',
        //     'def_polariser_scratches',
        //   ];
        //   setCheckedDefects(new Set(defaultDefects));
      }
    } catch (error) {
      // console.error('Error loading saved defects:', error);
      // // Fallback to default selection
      // const defaultDefects = [
      //   'def_horizontal_band',
      //   'def_white_patches',
      //   'def_polariser_scratches',
      // ];
      // setCheckedDefects(new Set(defaultDefects));
    }
    setIsLoading(false);
  }, [selectedDefects]);

  const handleDefectToggle = (defectKey) => {
    setCheckedDefects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(defectKey)) {
        newSet.delete(defectKey);
      } else {
        newSet.add(defectKey);
      }

      // Automatically save configuration after state update
      setTimeout(() => {
        handleSaveConfiguration(newSet);
      }, 0);

      return newSet;
    });
  };

  const handleSelectAll = () => {
    let newSet;
    if (checkedDefects.size === defectsList.length) {
      newSet = new Set();
    } else {
      newSet = new Set(defectsList.map((defect) => defect.key));
    }

    setCheckedDefects(newSet);

    // Automatically save configuration after state update
    setTimeout(() => {
      handleSaveConfiguration(newSet);
    }, 0);
  };

  const handleSaveConfiguration = (customCheckedDefects = null) => {
    setIsSaving(true);
    try {
      const defectsToSave = customCheckedDefects || checkedDefects;
      // Save to localStorage
      localStorage.setItem(
        'selectedDefects',
        JSON.stringify(Array.from(defectsToSave))
      );

      // Create the defect display map for the PredictedDefectsPage
      const selectedDefectsList = defectsList.filter((defect) =>
        defectsToSave.has(defect.key)
      );
      const defectDisplayMap = selectedDefectsList.map((defect) => ({
        key: defect.key,
        label: defect.name,
      }));

      // Pass the selected defects back to parent component
      if (onDefectsSelected) {
        onDefectsSelected(Array.from(defectsToSave), defectDisplayMap);
      }

      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    } catch (error) {
      console.error('Error saving defects configuration:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Loading defect configuration...</div>
        </div>
      </div>
    );
  }

  const allSelected = checkedDefects.size === defectsList.length;
  const someSelected = checkedDefects.size > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Defect Configuration
          </h2>
          <p className="text-gray-600 mt-1">
            Select which defects you want to monitor and check during inspection
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Available Defects ({checkedDefects.size} selected)
            </CardTitle>
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {defectsList.map((defect) => {
              const isChecked = checkedDefects.has(defect.key);
              return (
                <label
                  key={defect.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleDefectToggle(defect.key)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-sm">{defect.name}</div>
                    <div className="text-xs text-gray-500">
                      {defect.faultCode}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {checkedDefects.size} defect(s) selected for monitoring
                {isSaving && (
                  <span className="ml-2 text-blue-600 flex items-center gap-1">
                    <Save className="w-3 h-3 animate-pulse" />
                    Auto-saving...
                  </span>
                )}
              </div>
              {!someSelected && (
                <div className="text-sm text-red-500">
                  Please select at least one defect to monitor
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Configuration Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Selected defects will be monitored during the inspection process
          </li>
          <li>
            • Your configuration is automatically saved as you make changes
          </li>
          <li>• Changes persist across sessions and are applied immediately</li>
          <li>
            • Common defects like Horizontal Band, White Patches, and Polariser
            Scratches are selected by default
          </li>
        </ul>
      </div> */}
    </div>
  );
};

export default DefectConfiguration;
