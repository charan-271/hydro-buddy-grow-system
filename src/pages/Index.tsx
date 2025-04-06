import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import SystemHeader from '@/components/SystemHeader';
import Dashboard from '@/components/Dashboard';
import ControlPanel from '@/components/ControlPanel';
import CropProfiles from '@/components/CropProfiles';
import useWebSocket from '@/hooks/useWebSocket';
import { 
  mockCurrentReadings, 
  mockRelayStates, 
  mockSystemStatus, 
  mockCropProfiles,
  mockHistoricalData
} from '@/data/mockData';
import { 
  SensorReadings, 
  RelayStates, 
  SystemStatus, 
  CropProfile, 
  WebSocketMessage, 
  HistoricalData 
} from '@/types/types';

const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [currentReadings, setCurrentReadings] = useState<SensorReadings>(mockCurrentReadings);
  const [relayStates, setRelayStates] = useState<RelayStates>(mockRelayStates);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(mockSystemStatus);
  const [cropProfiles, setCropProfiles] = useState<CropProfile[]>(mockCropProfiles);
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  
  const [historicalData, setHistoricalData] = useState<HistoricalData>(mockHistoricalData);
  
  const activeProfile = cropProfiles.find(profile => profile.isActive) || cropProfiles[0];

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    const { type, data, timestamp } = message;
    
    switch (type) {
      case 'sensor_data':
        const sensorData = data as SensorReadings;
        setCurrentReadings(sensorData);
        
        setHistoricalData(prev => {
          const newData = { ...prev };
          
          Object.keys(sensorData).forEach(key => {
            if (key !== 'timestamp' && key in newData) {
              const typedKey = key as keyof Omit<SensorReadings, 'timestamp'>;
              const newPoint = {
                timestamp,
                value: sensorData[typedKey]
              };
              
              newData[typedKey] = [...newData[typedKey], newPoint].slice(-50);
            }
          });
          
          return newData;
        });
        break;
        
      case 'relay_status':
        setRelayStates(data as RelayStates);
        break;
        
      case 'system_status':
        setSystemStatus(data as SystemStatus);
        break;
    }
  };
  
  const { isConnected, sendMessage } = useWebSocket({
    url: WS_URL,
    onMessage: handleWebSocketMessage
  });

  const handleRelayToggle = (relay: keyof RelayStates) => {
    if (autoModeEnabled) return;
    
    setRelayStates(prev => {
      const newStates = { ...prev, [relay]: !prev[relay] };
      
      sendMessage({
        type: 'set_relay',
        relay,
        state: newStates[relay]
      });
      
      toast({
        title: `${relay.replace('Relay', '')} relay ${newStates[relay] ? 'activated' : 'deactivated'}`,
        description: `Manual control mode`,
      });
      
      return newStates;
    });
  };

  const handleAutoModeToggle = (enabled: boolean) => {
    setAutoModeEnabled(enabled);
    
    sendMessage({
      type: 'set_auto_mode',
      enabled
    });
    
    toast({
      title: `${enabled ? 'Automatic' : 'Manual'} mode enabled`,
      description: enabled 
        ? 'System will control parameters automatically' 
        : 'You can manually control relays now',
    });
  };

  const handleActivateProfile = (profileId: string) => {
    const selectedProfile = cropProfiles.find(p => p.id === profileId);
    
    setCropProfiles(prev => prev.map(profile => ({
      ...profile,
      isActive: profile.id === profileId
    })));
    
    if (selectedProfile) {
      sendMessage({
        type: 'set_profile',
        profile: selectedProfile
      });
      
      toast({
        title: `${selectedProfile.name} profile activated`,
        description: 'System parameters updated to match the selected crop profile',
      });
    }
  };

  useEffect(() => {
    let interval: number | undefined;
    
    if (!isConnected) {
      interval = window.setInterval(() => {
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
    }
    
    if (isConnected) {
      toast({
        title: "Connected to HydroBuddy",
        description: "Receiving real-time sensor data",
      });
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isConnected]);

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
              historicalData={historicalData}
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
