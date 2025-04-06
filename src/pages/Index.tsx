
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import SystemHeader from '@/components/SystemHeader';
import Dashboard from '@/components/Dashboard';
import ControlPanel from '@/components/ControlPanel';
import CropProfiles from '@/components/CropProfiles';
import { 
  mockCurrentReadings, 
  mockRelayStates, 
  mockSystemStatus, 
  mockCropProfiles,
  mockHistoricalData
} from '@/data/mockData';
import { SensorReadings, RelayStates, SystemStatus, CropProfile } from '@/types/types';

const Index = () => {
  // State for the active tab
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for sensor readings and system status
  const [currentReadings, setCurrentReadings] = useState<SensorReadings>(mockCurrentReadings);
  const [relayStates, setRelayStates] = useState<RelayStates>(mockRelayStates);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(mockSystemStatus);
  const [cropProfiles, setCropProfiles] = useState<CropProfile[]>(mockCropProfiles);
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  
  // Get the active crop profile
  const activeProfile = cropProfiles.find(profile => profile.isActive) || cropProfiles[0];

  // Function to handle relay toggles
  const handleRelayToggle = (relay: keyof RelayStates) => {
    if (autoModeEnabled) return;
    
    setRelayStates(prev => {
      const newStates = { ...prev, [relay]: !prev[relay] };
      toast({
        title: `${relay.replace('Relay', '')} relay ${newStates[relay] ? 'activated' : 'deactivated'}`,
        description: `Manual control mode`,
      });
      return newStates;
    });
  };

  // Function to handle auto mode toggle
  const handleAutoModeToggle = (enabled: boolean) => {
    setAutoModeEnabled(enabled);
    toast({
      title: `${enabled ? 'Automatic' : 'Manual'} mode enabled`,
      description: enabled 
        ? 'System will control parameters automatically' 
        : 'You can manually control relays now',
    });
  };

  // Function to activate a crop profile
  const handleActivateProfile = (profileId: string) => {
    setCropProfiles(prev => prev.map(profile => ({
      ...profile,
      isActive: profile.id === profileId
    })));
    
    const selectedProfile = cropProfiles.find(p => p.id === profileId);
    if (selectedProfile) {
      toast({
        title: `${selectedProfile.name} profile activated`,
        description: 'System parameters updated to match the selected crop profile',
      });
    }
  };

  // Simulate sensor reading updates 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReadings(prev => ({
        ...prev,
        airTemperature: +(prev.airTemperature + (Math.random() - 0.5) * 0.2).toFixed(1),
        airHumidity: Math.round(prev.airHumidity + (Math.random() - 0.5) * 0.8),
        waterTemperature: +(prev.waterTemperature + (Math.random() - 0.5) * 0.1).toFixed(1),
        tds: Math.round(prev.tds + (Math.random() - 0.5) * 8),
        ph: +(prev.ph + (Math.random() - 0.5) * 0.05).toFixed(1),
        timestamp: new Date().toISOString()
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
              currentReadings={currentReadings}
              relayStates={relayStates}
              historicalData={mockHistoricalData}
              activeProfile={activeProfile}
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
