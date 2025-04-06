
import React, { useState } from 'react';
import SystemHeader from '@/components/SystemHeader';
import Dashboard from '@/components/Dashboard';
import ControlPanel from '@/components/ControlPanel';
import CropProfiles from '@/components/CropProfiles';
import useHydroData from '@/hooks/useHydroData';
import { 
  mockCurrentReadings, 
  mockRelayStates, 
  mockSystemStatus, 
  mockCropProfiles,
  mockHistoricalData
} from '@/data/mockData';

// This would typically come from an environment variable or user input
const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || 'hydrobuddy-001';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const {
    currentReadings,
    relayStates,
    systemStatus,
    historicalData,
    cropProfiles,
    activeProfile,
    autoModeEnabled,
    isLoading,
    handleRelayToggle,
    handleAutoModeToggle,
    handleActivateProfile
  } = useHydroData({
    deviceId: DEVICE_ID,
    pollingInterval: 10000, // 10 seconds
    initialSensorReadings: mockCurrentReadings,
    initialRelayStates: mockRelayStates,
    initialSystemStatus: mockSystemStatus,
    initialHistoricalData: mockHistoricalData,
    initialCropProfiles: mockCropProfiles
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        <SystemHeader 
          status={systemStatus} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        />
        
        <main className="py-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              currentReadings={currentReadings || mockCurrentReadings}
              relayStates={relayStates || mockRelayStates}
              historicalData={historicalData || mockHistoricalData}
              activeProfile={activeProfile || mockCropProfiles[0]}
            />
          )}
          
          {activeTab === 'controls' && (
            <ControlPanel 
              relayStates={relayStates || mockRelayStates}
              onRelayToggle={handleRelayToggle}
              onAutoModeToggle={handleAutoModeToggle}
              autoModeEnabled={autoModeEnabled}
            />
          )}
          
          {activeTab === 'profiles' && (
            <CropProfiles 
              profiles={cropProfiles || mockCropProfiles}
              onActivateProfile={handleActivateProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
