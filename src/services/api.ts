
import { 
  SensorReadings, 
  RelayStates, 
  CropProfile, 
  HistoricalData,
  SensorReadingModel,
  RelayStateModel,
  CropProfileModel,
  DeviceModel,
  SystemStatus
} from '@/types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const DEFAULT_DEVICE_ID = import.meta.env.VITE_DEVICE_ID || 'hydrobuddy-001';

// Helper for making API requests
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Sensor data APIs
export async function getLatestSensorData(deviceId: string = DEFAULT_DEVICE_ID): Promise<SensorReadings> {
  return fetchApi<SensorReadings>(`/sensors/latest?deviceId=${deviceId}`);
}

export async function getSensorHistory(
  deviceId: string = DEFAULT_DEVICE_ID, 
  limit: number = 50
): Promise<HistoricalData> {
  return fetchApi<HistoricalData>(`/sensors/history?deviceId=${deviceId}&limit=${limit}`);
}

export async function postSensorData(
  data: Omit<SensorReadingModel, 'id'>,
): Promise<SensorReadingModel> {
  return fetchApi<SensorReadingModel>('/sensors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Relay state APIs
export async function getRelayStates(deviceId: string = DEFAULT_DEVICE_ID): Promise<RelayStates> {
  return fetchApi<RelayStates>(`/relays?deviceId=${deviceId}`);
}

export async function updateRelayState(
  deviceId: string = DEFAULT_DEVICE_ID,
  relay: keyof RelayStates,
  state: boolean
): Promise<RelayStates> {
  return fetchApi<RelayStates>(`/relays/${relay}`, {
    method: 'PUT',
    body: JSON.stringify({ deviceId, state }),
  });
}

// Crop profile APIs
export async function getCropProfiles(deviceId: string = DEFAULT_DEVICE_ID): Promise<CropProfile[]> {
  return fetchApi<CropProfile[]>(`/profiles?deviceId=${deviceId}`);
}

export async function activateCropProfile(
  deviceId: string = DEFAULT_DEVICE_ID,
  profileId: string
): Promise<CropProfile> {
  return fetchApi<CropProfile>(`/profiles/${profileId}/activate`, {
    method: 'PUT',
    body: JSON.stringify({ deviceId }),
  });
}

// Device APIs
export async function getDevices(): Promise<DeviceModel[]> {
  return fetchApi<DeviceModel[]>('/devices');
}

export async function getDeviceStatus(deviceId: string = DEFAULT_DEVICE_ID): Promise<SystemStatus> {
  return fetchApi<SystemStatus>(`/devices/${deviceId}/status`);
}

// System mode APIs
export async function setAutoMode(
  deviceId: string = DEFAULT_DEVICE_ID,
  enabled: boolean
): Promise<{ autoMode: boolean }> {
  return fetchApi<{ autoMode: boolean }>(`/system/auto-mode`, {
    method: 'PUT',
    body: JSON.stringify({ deviceId, enabled }),
  });
}

// Export all API functions
export const api = {
  getLatestSensorData,
  getSensorHistory,
  postSensorData,
  getRelayStates,
  updateRelayState,
  getCropProfiles,
  activateCropProfile,
  getDevices,
  getDeviceStatus,
  setAutoMode,
};

export default api;
