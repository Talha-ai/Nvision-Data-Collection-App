import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

interface EBC {
  exposure: number;
  brightness: number;
  contrast: number;
}

interface PatternEBCState {
  [pattern: string]: EBC;
}

interface PatternEBCPageProps {
  patternEBC: PatternEBCState;
  setPatternEBC: React.Dispatch<React.SetStateAction<PatternEBCState>>;
  testPatterns: { name: string; src: string }[];
  handleResetPatternEBC: () => void;
}

const PatternEBCPage: React.FC<PatternEBCPageProps> = ({ patternEBC, setPatternEBC, testPatterns, handleResetPatternEBC }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pattern EBC Settings</CardTitle>
        <Button variant="secondary" size="sm" onClick={handleResetPatternEBC}>
          Reset Pattern EBC
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testPatterns.map(({ name, src }) => (
            <Collapsible key={name} className="border rounded-lg">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-accent rounded-md">
                  <div className="flex items-center gap-2">
                    <img src={src} alt={name} className="w-8 h-8 object-contain" />
                    <span className="font-medium">{name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="pointer-events-none">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4">
                <div className="flex gap-4 flex-wrap">
                  {(['exposure', 'brightness', 'contrast'] as const).map((key) => (
                    <div key={key} className="flex-1 min-w-[120px]">
                      <label className="block font-medium capitalize">{key}</label>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={patternEBC[name][key]}
                        onChange={e => setPatternEBC(prev => ({
                          ...prev,
                          [name]: {
                            ...prev[name],
                            [key]: Number(e.target.value),
                          },
                        }))}
                      />
                      <span className="text-xs">{patternEBC[name][key]}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternEBCPage; 