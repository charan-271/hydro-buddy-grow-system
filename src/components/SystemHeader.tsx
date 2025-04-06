
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusIndicator from './StatusIndicator';
import { SystemStatus } from '@/types/types';

interface SystemHeaderProps {
  status: SystemStatus;
  activeTab: string;
  setActiveTab: (value: string) => void;
  connected?: boolean;
}

const SystemHeader: React.FC<SystemHeaderProps> = ({ status, activeTab, setActiveTab, connected = false }) => {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b pb-4">
      <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-hydro-green p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M20 16a8 8 0 1 1-5.3-7.5" />
              <path d="M12 12v4" />
              <path d="M12 12h4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Hydro Buddy</h1>
        </div>
        
        <StatusIndicator status={status} connected={connected} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start md:justify-center overflow-x-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="profiles">Crop Profiles</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SystemHeader;
