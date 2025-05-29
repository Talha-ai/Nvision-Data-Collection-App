import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface DefectStat {
  defect_name: string;
  fault_code: string;
  panel_count: number;
}

interface StatsData {
  total_images_captured: number;
  total_panels_tested: number;
  defect_statistics: DefectStat[];
}

const SummaryPage: React.FC = () => {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [defects, setDefects] = useState<DefectStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(() => {
    const savedMode = localStorage.getItem('appMode');
    return savedMode ? savedMode === 'test' : false;
  });
  const [fullStatsData, setFullStatsData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(
        'https://nvision.alemeno.com/data/panel-image-search/stats/'
      );
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setFullStatsData(data);
      const modeData = isTestMode ? data.test : data.production;
      setStatsData(modeData);
      setDefects(modeData.defect_statistics);
    } catch (error) {
      setStatsData(null);
      setDefects([]);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  useEffect(() => {
    const modeData = isTestMode
      ? fullStatsData?.test
      : fullStatsData?.production;
    setStatsData(modeData);
    setDefects(modeData?.defect_statistics);
  }, [isTestMode]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Statistics</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title="Refresh Statistics"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* <div className="flex items-center gap-4 mb-2">
          <span className="font-semibold">App mode:</span>
          <div className="relative">
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isTestMode
                    ? 'bg-green-500 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : ' text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setIsTestMode(false)}
              >
                Production
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isTestMode
                    ? 'bg-yellow-500 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : ' text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setIsTestMode(true)}
              >
                Test
              </button>
            </div>
          </div>
        </div> */}
        {statsLoading ? (
          <p>Loading statistics...</p>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-3">Total panels tested</td>
                <td className="py-3">
                  {statsData ? statsData.total_panels_tested : 0}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Total images captured</td>
                <td className="py-3">
                  {statsData ? statsData.total_images_captured : 0}
                </td>
              </tr>
              {defects.map((defect, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3">Panels with {defect.defect_name}</td>
                  <td className="py-3">{defect.panel_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryPage;
