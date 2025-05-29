import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const mockData = [
  { ppid: 'PANEL001', timestamp: '2024-06-01 10:00', prediction: 'OK', correction: 'OK' },
  { ppid: 'PANEL002', timestamp: '2024-06-01 10:05', prediction: 'Defect', correction: 'OK' },
  { ppid: 'PANEL003', timestamp: '2024-06-01 10:10', prediction: 'OK', correction: 'Defect' },
  { ppid: 'PANEL004', timestamp: '2024-06-01 10:15', prediction: 'Defect', correction: 'Defect' },
];

function PastDataPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Past Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2 font-semibold">PPID</th>
                  <th className="text-left px-4 py-2 font-semibold">Timestamp</th>
                  <th className="text-left px-4 py-2 font-semibold">Prediction</th>
                  <th className="text-left px-4 py-2 font-semibold">Correction</th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="px-4 py-2">{row.ppid}</td>
                    <td className="px-4 py-2">{row.timestamp}</td>
                    <td className="px-4 py-2">{row.prediction}</td>
                    <td className="px-4 py-2">{row.correction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PastDataPage; 