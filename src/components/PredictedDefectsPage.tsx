import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Dummy result set for demonstration
const dummyDefects = {
  'VID - Abnormal Display Defect Not Found': true,
  'VID - Horizontal Line Defect Not Found': true,
  'VID - Horizontal Band Defect Found': false,
  'VID - Vertical Line Defect Not Found': true,
  'VID - Vertical Band Defect Not Found': true,
  'VID - Particles Defect Not Found': true,
  'CID - White Patch Defect Not Found': true,
  'CID - Polariser Scratches / Dent Defect Not Found': true,
  'VID - Light Leakage Defect Not Found': true,
  'VID - Mura Defect Not Found': true,
  'VID - Incoming Border Patch Defect Not Found': true,
  'VID - Pixel Bright Dot Defect Not Found': true,
  'BER - Incoming Galaxy Defect Not Found': false,
  'VID - Led Off Defect Found': false,
  'VID - Bleeding Defect Not Found': false,
  'NTF - No Trouble Found Defect Not Found': true,
  'Other Defects Defect Not Found': true,
};

function PredictedDefectsPage({ defects = dummyDefects }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Defect report</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(defects).map(([defect, found], idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${found ? 'bg-green-500' : 'bg-red-500'}`}
                ></span>
                <span>{defect}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default PredictedDefectsPage; 