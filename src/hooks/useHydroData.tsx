
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  SensorReadings, 
  RelayStates, 
  SystemStatus, 
  HistoricalData, 
  CropProfile 
} from '@/types/types';
import {
  fetchLatestSensorData,
  fetchHistoricalData,
  fetchCropProfiles,
  updateRelayState,
  setAutoMode,
  activateCropProfile
} from '@/services/apiService';

// Default polling interval in milliseconds (10 seconds)
const DEFAULT_POLLING_INTERVAL = 10000;

interface UseHydroDataProps {
  deviceId: string;
  pollingInterval?: number;
  initialSensorReadings?: SensorReadings;
  initialRelayStates?: RelayStates;
  initialSystemStatus?: SystemStatus;
  initialHistoricalData?: HistoricalData;
  initialCropProfiles?: CropProfile[];
}

export default function useHydroData({
  deviceId,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  initialSensorReadings,
  initialRelayStates,
  initialSystemStatus,
  initialHistoricalData,
  initialCropProfiles
}: UseHydroDataProps) {
  const [autoModeEnabled, setAutoModeEnabled] = useState(true);
  const queryClient = useQueryClient();

  // Query for latest sensor data
  const { 
    data: latestData,
    isLoading: isLoadingLatest,
    isError: isLatestError,
    error: latestError
  } = useQuery({
    queryKey: ['hydroData', 'latest', deviceId],
    queryFn: async () => {
      const response = await fetchLatestSensorData(deviceId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch latest data');
      }
      return response.data;
    },
    initialData: initialSensorReadings && initialRelayStates && initialSystemStatus ? {
      sensorReadings: initialSensorReadings,
      relayStates: initialRelayStates,
      systemStatus: initialSystemStatus
    } : undefined,
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: true
  });

  // Query for historical data
  const { 
    data: historicalData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    error: historyError
  } = useQuery({
    queryKey: ['hydroData', 'history', deviceId],
    queryFn: async () => {
      const response = await fetchHistoricalData({ deviceId, limit: 50 });
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch historical data');
      }
      return response.data;
    },
    initialData: initialHistoricalData,
    refetchInterval: pollingInterval * 3,
    refetchOnWindowFocus: true
  });

  // Query for crop profiles
  const { 
    data: cropProfiles,
    isLoading: isLoadingProfiles,
    isError: isProfilesError,
    error: profilesError
  } = useQuery({
    queryKey: ['hydroData', 'profiles'],
    queryFn: async () => {
      const response = await fetchCropProfiles();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch crop profiles');
      }
      return response.data;
    },
    initialData: initialCropProfiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for updating relay state
  const relayMutation = useMutation({
    mutationFn: ({ relay, state }: { relay: keyof RelayStates, state: boolean }) => 
      updateRelayState(deviceId, relay, state),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['hydroData', 'latest', deviceId], (oldData: any) => ({
          ...oldData,
          relayStates: data.data
        }));
        toast({
          title: `${relay.replace('Relay', '')} relay ${state ? 'activated' : 'deactivated'}`,
          description: 'Manual control mode',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to update relay',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Mutation for setting auto mode
  const autoModeMutation = useMutation({
    mutationFn: (enabled: boolean) => setAutoMode(deviceId, enabled),
    onSuccess: (data, enabled) => {
      if (data.success) {
        setAutoModeEnabled(enabled);
        toast({
          title: `${enabled ? 'Automatic' : 'Manual'} mode enabled`,
          description: enabled 
            ? 'System will control parameters automatically' 
            : 'You can manually control relays now',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to change mode',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Mutation for activating crop profile
  const profileMutation = useMutation({
    mutationFn: (profileId: string) => activateCropProfile(deviceId, profileId),
    onSuccess: (data, profileId) => {
      if (data.success) {
        queryClient.setQueryData(['hydroData', 'profiles'], (oldProfiles: CropProfile[] | undefined) => {
          if (!oldProfiles) return oldProfiles;
          return oldProfiles.map(profile => ({
            ...profile,
            isActive: profile.id === profileId
          }));
        });
        toast({
          title: `${data.data.name} profile activated`,
          description: 'System parameters updated to match the selected crop profile',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to activate profile',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Handle relay toggle
  const handleRelayToggle = useCallback((relay: keyof RelayStates) => {
    if (autoModeEnabled || !latestData) return;
    
    const newState = !latestData.relayStates[relay];
    relayMutation.mutate({ relay, state: newState });
  }, [autoModeEnabled, latestData, relayMutation]);

  // Handle auto mode toggle
  const handleAutoModeToggle = useCallback((enabled: boolean) => {
    autoModeMutation.mutate(enabled);
  }, [autoModeMutation]);

  // Handle activate profile
  const handleActivateProfile = useCallback((profileId: string) => {
    profileMutation.mutate(profileId);
  }, [profileMutation]);

  // Get active profile
  const activeProfile = cropProfiles?.find(profile => profile.isActive) || cropProfiles?.[0];

  // Check if any data is loading
  const isLoading = isLoadingLatest || isLoadingHistory || isLoadingProfiles;

  // Check if any errors occurred
  const hasError = isLatestError || isHistoryError || isProfilesError;
  const errorMessage = latestError || historyError || profilesError;

  // Show error toast if needed
  useEffect(() => {
    if (hasError && errorMessage) {
      toast({
        title: 'Connection Error',
        description: errorMessage instanceof Error ? errorMessage.message : 'Failed to connect to the server',
        variant: 'destructive'
      });
    }
  }, [hasError, errorMessage]);

  return {
    currentReadings: latestData?.sensorReadings,
    relayStates: latestData?.relayStates,
    systemStatus: latestData?.systemStatus || 'offline',
    historicalData,
    cropProfiles,
    activeProfile,
    autoModeEnabled,
    isLoading,
    hasError,
    handleRelayToggle,
    handleAutoModeToggle,
    handleActivateProfile
  };
}
