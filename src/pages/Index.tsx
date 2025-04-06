
import React, { useState } from 'react';
import SystemHeader from '@/components/SystemHeader';
import Dashboard from '@/components/Dashboard';
import ControlPanel from '@/components/ControlPanel';
import CropProfiles from '@/components/CropProfiles';
import useHydroData from '@/hooks/useHydroData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const {
    currentReadings,
    relayStates,
    historicalData,
    cropProfiles,
    systemStatus,
    autoModeEnabled,
    activeProfile,
    handleRelayToggle,
    handleAutoModeToggle,
    handleActivateProfile,
    isConnected,
  } = useHydroData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        <SystemHeader 
          status={systemStatus} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          connected={isConnected}
        />
        
        <main className="py-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              currentReadings={currentReadings}
              relayStates={relayStates}
              historicalData={historicalData}
              activeProfile={activeProfile || cropProfiles[0]}
            />
          )}
          
          {activeTab === 'controls' && (
            <ControlPanel 
              relayStates={relayStates}
              onRelayToggle={handleRelayToggle}
              onAutoModeToggle={handleAutoModeToggle}
              autoModeEnabled={autoModeEnabled}
            />
          )}
          
          {activeTab === 'profiles' && (
            <CropProfiles 
              profiles={cropProfiles}
              onActivateProfile={handleActivateProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
