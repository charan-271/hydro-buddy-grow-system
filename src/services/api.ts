
import { supabase } from '@/integrations/supabase/client';
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
import { mockCurrentReadings, mockRelayStates, mockCropProfiles, mockHistoricalData } from '@/data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const DEFAULT_DEVICE_ID = import.meta.env.VITE_DEVICE_ID || 'hydrobuddy-001';
const USE_MOCK_DATA = false; // Set to false to use real Supabase data

// Sensor data APIs
export async function getLatestSensorData(deviceId: string = DEFAULT_DEVICE_ID): Promise<SensorReadings> {
  if (USE_MOCK_DATA) return mockCurrentReadings;
  
  try {
    const { data, error } = await supabase
      .from('latest_sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) {
      console.warn('No sensor data found, using mock data');
      return mockCurrentReadings;
    }
    
    return {
      airTemperature: Number(data.air_temperature),
      airHumidity: Number(data.air_humidity),
      waterTemperature: Number(data.water_temperature),
      tds: Number(data.tds),
      ph: Number(data.ph),
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
    return mockCurrentReadings;
  }
}

export async function getSensorHistory(
  deviceId: string = DEFAULT_DEVICE_ID, 
  limit: number = 50
): Promise<HistoricalData> {
  if (USE_MOCK_DATA) return mockHistoricalData;
  
  try {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.warn('No historical data found, using mock data');
      return mockHistoricalData;
    }
    
    // Transform the data to match the HistoricalData type
    const historicalData: HistoricalData = {
      airTemperature: [],
      airHumidity: [],
      waterTemperature: [],
      tds: [],
      ph: []
    };
    
    // Reverse the data to get chronological order
    const chronologicalData = [...data].reverse();
    
    chronologicalData.forEach(reading => {
      historicalData.airTemperature.push({ 
        timestamp: reading.timestamp, 
        value: Number(reading.air_temperature) 
      });
      historicalData.airHumidity.push({ 
        timestamp: reading.timestamp, 
        value: Number(reading.air_humidity) 
      });
      historicalData.waterTemperature.push({ 
        timestamp: reading.timestamp, 
        value: Number(reading.water_temperature) 
      });
      historicalData.tds.push({ 
        timestamp: reading.timestamp, 
        value: Number(reading.tds) 
      });
      historicalData.ph.push({ 
        timestamp: reading.timestamp, 
        value: Number(reading.ph) 
      });
    });
    
    return historicalData;
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return mockHistoricalData;
  }
}

export async function postSensorData(
  data: Omit<SensorReadingModel, 'id'>,
): Promise<SensorReadingModel> {
  try {
    const { data: result, error } = await supabase
      .from('sensor_readings')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Failed to post sensor data:', error);
    throw error;
  }
}

// Relay state APIs
export async function getRelayStates(deviceId: string = DEFAULT_DEVICE_ID): Promise<RelayStates> {
  if (USE_MOCK_DATA) return mockRelayStates;
  
  try {
    const { data, error } = await supabase
      .from('latest_relay_states')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) {
      console.warn('No relay states found, using mock data');
      return mockRelayStates;
    }
    
    return {
      tdsRelay: data.tds_relay || false,
      humidityRelay: data.humidity_relay || false,
      airCirculationRelay: data.air_circulation_relay || false
    };
  } catch (error) {
    console.error('Failed to fetch relay states:', error);
    return mockRelayStates;
  }
}

export async function updateRelayState(
  deviceId: string = DEFAULT_DEVICE_ID,
  relay: keyof RelayStates,
  state: boolean
): Promise<RelayStates> {
  try {
    // Map our app's relay keys to database column names
    const relayMap: Record<keyof RelayStates, string> = {
      tdsRelay: 'tds_relay',
      humidityRelay: 'humidity_relay',
      airCirculationRelay: 'air_circulation_relay'
    };
    
    const relayColumn = relayMap[relay];
    
    // Insert a new row with the updated relay state
    const insertData: any = {
      device_id: deviceId,
      [relayColumn]: state
    };
    
    // Set default values for other relays based on current state
    const currentStates = await getRelayStates(deviceId);
    
    Object.entries(relayMap).forEach(([key, column]) => {
      if (column !== relayColumn) {
        insertData[column] = currentStates[key as keyof RelayStates];
      }
    });
    
    const { data, error } = await supabase
      .from('relay_states')
      .insert(insertData)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      tdsRelay: data.tds_relay,
      humidityRelay: data.humidity_relay,
      airCirculationRelay: data.air_circulation_relay
    };
  } catch (error) {
    console.error('Failed to update relay state:', error);
    // Return current state with the requested change
    const currentState = await getRelayStates(deviceId);
    return {
      ...currentState,
      [relay]: state
    };
  }
}

// Crop profile APIs
export async function getCropProfiles(deviceId: string = DEFAULT_DEVICE_ID): Promise<CropProfile[]> {
  if (USE_MOCK_DATA) return mockCropProfiles;
  
  try {
    const { data, error } = await supabase
      .from('crop_profiles')
      .select('*')
      .eq('device_id', deviceId);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.warn('No crop profiles found, using mock data');
      return mockCropProfiles;
    }
    
    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      minAirTemp: Number(profile.min_air_temp),
      maxAirTemp: Number(profile.max_air_temp),
      minAirHumidity: Number(profile.min_air_humidity),
      maxAirHumidity: Number(profile.max_air_humidity),
      minWaterTemp: Number(profile.min_water_temp),
      maxWaterTemp: Number(profile.max_water_temp),
      minTds: Number(profile.min_tds),
      maxTds: Number(profile.max_tds),
      minPh: Number(profile.min_ph),
      maxPh: Number(profile.max_ph),
      isActive: profile.is_active
    }));
  } catch (error) {
    console.error('Failed to fetch crop profiles:', error);
    return mockCropProfiles;
  }
}

export async function activateCropProfile(
  deviceId: string = DEFAULT_DEVICE_ID,
  profileId: string
): Promise<CropProfile> {
  try {
    // First, set all profiles to inactive
    const { error: updateError } = await supabase
      .from('crop_profiles')
      .update({ is_active: false })
      .eq('device_id', deviceId);
      
    if (updateError) throw updateError;
    
    // Then set the selected profile to active
    const { data, error } = await supabase
      .from('crop_profiles')
      .update({ is_active: true })
      .eq('id', profileId)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      minAirTemp: Number(data.min_air_temp),
      maxAirTemp: Number(data.max_air_temp),
      minAirHumidity: Number(data.min_air_humidity),
      maxAirHumidity: Number(data.max_air_humidity),
      minWaterTemp: Number(data.min_water_temp),
      maxWaterTemp: Number(data.max_water_temp),
      minTds: Number(data.min_tds),
      maxTds: Number(data.max_tds),
      minPh: Number(data.min_ph),
      maxPh: Number(data.max_ph),
      isActive: data.is_active
    };
  } catch (error) {
    console.error('Failed to activate crop profile:', error);
    throw error;
  }
}

// Device APIs
export async function getDevices(): Promise<DeviceModel[]> {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    return [];
  }
}

export async function getDeviceStatus(deviceId: string = DEFAULT_DEVICE_ID): Promise<SystemStatus> {
  if (USE_MOCK_DATA) return 'online';
  
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('status')
      .eq('id', deviceId)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) {
      console.warn('No device status found, returning offline');
      return 'offline';
    }
    
    return data.status as SystemStatus || 'offline';
  } catch (error) {
    console.error('Failed to fetch device status:', error);
    return 'offline';
  }
}

// System mode APIs
export async function setAutoMode(
  deviceId: string = DEFAULT_DEVICE_ID,
  enabled: boolean
): Promise<{ autoMode: boolean }> {
  // This is a mock implementation since we don't have a specific table for auto mode
  // In a real implementation, you would store this in a settings table
  return { autoMode: enabled };
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
