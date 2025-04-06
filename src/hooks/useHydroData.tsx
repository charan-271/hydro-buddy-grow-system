
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { 
  SensorReadings, 
  RelayStates, 
  CropProfile, 
  HistoricalData, 
  SystemStatus 
} from '@/types/types';
import { mockCurrentReadings, mockRelayStates, mockCropProfiles, mockHistoricalData } from '@/data/mockData';

const DEFAULT_POLLING_INTERVAL = 10000; // 10 seconds
const DEFAULT_DEVICE_ID = import.meta.env.VITE_DEVICE_ID || 'hydrobuddy-001';

export function useHydroData(deviceId: string = DEFAULT_DEVICE_ID) {
  const queryClient = useQueryClient();
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  
  // Query for latest sensor readings
  const sensorReadingsQuery = useQuery({
    queryKey: ['sensor-data', deviceId],
    queryFn: () => api.getLatestSensorData(deviceId),
    refetchInterval: DEFAULT_POLLING_INTERVAL,
    initialData: mockCurrentReadings,
    onError: (error) => {
      console.error('Failed to fetch sensor data:', error);
      toast({
        title: 'Data Fetch Error',
        description: 'Could not retrieve the latest sensor readings',
        variant: 'destructive',
      });
    }
  });

  // Query for relay states
  const relayStatesQuery = useQuery({
    queryKey: ['relay-states', deviceId],
    queryFn: () => api.getRelayStates(deviceId),
    refetchInterval: DEFAULT_POLLING_INTERVAL,
    initialData: mockRelayStates,
    onError: (error) => {
      console.error('Failed to fetch relay states:', error);
    }
  });

  // Query for historical data
  const historicalDataQuery = useQuery({
    queryKey: ['historical-data', deviceId],
    queryFn: () => api.getSensorHistory(deviceId),
    refetchInterval: DEFAULT_POLLING_INTERVAL,
    initialData: mockHistoricalData,
    onError: (error) => {
      console.error('Failed to fetch historical data:', error);
    }
  });

  // Query for crop profiles
  const cropProfilesQuery = useQuery({
    queryKey: ['crop-profiles', deviceId],
    queryFn: () => api.getCropProfiles(deviceId),
    initialData: mockCropProfiles,
    onError: (error) => {
      console.error('Failed to fetch crop profiles:', error);
    }
  });

  // Query for system status
  const systemStatusQuery = useQuery({
    queryKey: ['system-status', deviceId],
    queryFn: () => api.getDeviceStatus(deviceId),
    refetchInterval: DEFAULT_POLLING_INTERVAL,
    initialData: 'online' as SystemStatus,
    onError: (error) => {
      console.error('Failed to fetch system status:', error);
    }
  });

  // Mutation for toggling a relay
  const toggleRelayMutation = useMutation({
    mutationFn: ({ relayKey, newState }: { relayKey: keyof RelayStates, newState: boolean }) => 
      api.updateRelayState(deviceId, relayKey, newState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relay-states', deviceId] });
    },
    onError: (error) => {
      console.error('Failed to toggle relay:', error);
      toast({
        title: 'Relay Control Error',
        description: 'Could not change the relay state',
        variant: 'destructive',
      });
    }
  });

  // Mutation for setting auto mode
  const setAutoModeMutation = useMutation({
    mutationFn: (enabled: boolean) => api.setAutoMode(deviceId, enabled),
    onSuccess: (data) => {
      setAutoModeEnabled(data.autoMode);
      toast({
        title: `${data.autoMode ? 'Automatic' : 'Manual'} mode enabled`,
        description: data.autoMode 
          ? 'System will control parameters automatically' 
          : 'You can manually control relays now',
      });
    },
    onError: (error) => {
      console.error('Failed to set auto mode:', error);
      toast({
        title: 'Mode Change Error',
        description: 'Could not change system mode',
        variant: 'destructive',
      });
    }
  });

  // Mutation for activating a crop profile
  const activateProfileMutation = useMutation({
    mutationFn: (profileId: string) => api.activateCropProfile(deviceId, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-profiles', deviceId] });
      toast({
        title: 'Profile Activated',
        description: 'Crop profile has been set as active',
      });
    },
    onError: (error) => {
      console.error('Failed to activate profile:', error);
      toast({
        title: 'Profile Activation Error',
        description: 'Could not activate the selected profile',
        variant: 'destructive',
      });
    }
  });

  // Handlers for UI interactions
  const handleRelayToggle = useCallback((relayKey: keyof RelayStates) => {
    if (autoModeEnabled) return;
    
    const currentState = relayStatesQuery.data?.[relayKey] || false;
    toggleRelayMutation.mutate({ 
      relayKey, 
      newState: !currentState 
    });
  }, [autoModeEnabled, relayStatesQuery.data, toggleRelayMutation]);

  const handleAutoModeToggle = useCallback((enabled: boolean) => {
    setAutoModeMutation.mutate(enabled);
  }, [setAutoModeMutation]);

  const handleActivateProfile = useCallback((profileId: string) => {
    activateProfileMutation.mutate(profileId);
  }, [activateProfileMutation]);

  // Return all data and handlers for use in components
  return {
    // Data
    currentReadings: sensorReadingsQuery.data,
    relayStates: relayStatesQuery.data,
    historicalData: historicalDataQuery.data,
    cropProfiles: cropProfilesQuery.data,
    systemStatus: systemStatusQuery.data,
    autoModeEnabled,
    activeProfile: cropProfilesQuery.data?.find(profile => profile.isActive) || cropProfilesQuery.data?.[0],
    
    // Loading states
    isLoadingSensorData: sensorReadingsQuery.isLoading,
    isLoadingRelayStates: relayStatesQuery.isLoading,
    isLoadingHistoricalData: historicalDataQuery.isLoading,
    isLoadingCropProfiles: cropProfilesQuery.isLoading,
    isLoadingSystemStatus: systemStatusQuery.isLoading,
    
    // Action handlers
    handleRelayToggle,
    handleAutoModeToggle,
    handleActivateProfile,
    
    // Additional metadata
    isConnected: !sensorReadingsQuery.isError && !systemStatusQuery.isError
  };
}

export default useHydroData;
