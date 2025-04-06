
import { ApiResponse, SensorReadings, HistoricalData, RelayStates, SystemStatus, SensorDataPostPayload, FetchSensorDataParams, CropProfile } from "@/types/types";

// Replace this with your actual API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        data: {} as T,
        error: errorData.message || `Error: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      data: {} as T,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fetch the latest sensor data
 */
export async function fetchLatestSensorData(deviceId: string): Promise<ApiResponse<{
  sensorReadings: SensorReadings;
  relayStates: RelayStates;
  systemStatus: SystemStatus;
}>> {
  return fetchWithErrorHandling(`${API_BASE_URL}/sensors/latest?deviceId=${deviceId}`);
}

/**
 * Fetch historical sensor data
 */
export async function fetchHistoricalData(params: FetchSensorDataParams): Promise<ApiResponse<HistoricalData>> {
  const queryParams = new URLSearchParams();
  queryParams.append('deviceId', params.deviceId);
  
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);
  
  return fetchWithErrorHandling(`${API_BASE_URL}/sensors/history?${queryParams.toString()}`);
}

/**
 * Post new sensor data (for ESP32 to call)
 */
export async function postSensorData(data: SensorDataPostPayload): Promise<ApiResponse<{ success: boolean }>> {
  return fetchWithErrorHandling(`${API_BASE_URL}/sensors`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Fetch crop profiles
 */
export async function fetchCropProfiles(): Promise<ApiResponse<CropProfile[]>> {
  return fetchWithErrorHandling(`${API_BASE_URL}/crops`);
}

/**
 * Update relay states
 */
export async function updateRelayState(
  deviceId: string, 
  relay: keyof RelayStates, 
  state: boolean
): Promise<ApiResponse<RelayStates>> {
  return fetchWithErrorHandling(`${API_BASE_URL}/controls/relay`, {
    method: 'POST',
    body: JSON.stringify({ deviceId, relay, state })
  });
}

/**
 * Set auto mode
 */
export async function setAutoMode(
  deviceId: string, 
  enabled: boolean
): Promise<ApiResponse<{ autoMode: boolean }>> {
  return fetchWithErrorHandling(`${API_BASE_URL}/controls/mode`, {
    method: 'POST',
    body: JSON.stringify({ deviceId, autoMode: enabled })
  });
}

/**
 * Activate crop profile
 */
export async function activateCropProfile(
  deviceId: string, 
  profileId: string
): Promise<ApiResponse<CropProfile>> {
  return fetchWithErrorHandling(`${API_BASE_URL}/crops/activate`, {
    method: 'POST',
    body: JSON.stringify({ deviceId, profileId })
  });
}
