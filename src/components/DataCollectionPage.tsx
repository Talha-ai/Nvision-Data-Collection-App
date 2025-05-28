import React, { useState, useEffect } from 'react';
import DefectCheckerPage from './DefectCheckerPage';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const DataCollectionPage = (props: any) => {

  return (
    <div>
      {/* <div className="flex items-center justify-between mb-2"> */}
        {/* <h2 className="text-xl font-semibold">Data Collection</h2>
        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh Camera">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div> */}
      <DefectCheckerPage {...props}  />
    </div>
  );
};

export default DataCollectionPage; 