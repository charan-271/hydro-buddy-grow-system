
// Sensor reading types
export interface SensorReadings {
  airTemperature: number;
  airHumidity: number;
  waterTemperature: number;
  tds: number;
  ph: number;
  timestamp: string;
}

// Control relay states
export interface RelayStates {
  tdsRelay: boolean;
  humidityRelay: boolean;
  airCirculationRelay: boolean;
}

// System status
export type SystemStatus = 'online' | 'offline' | 'warning' | 'error';

// Crop profile configuration
export interface CropProfile {
  id: string;
  name: string;
  minAirTemp: number;
  maxAirTemp: number;
  minAirHumidity: number;
  maxAirHumidity: number;
  minWaterTemp: number;
  maxWaterTemp: number;
  minTds: number;
  maxTds: number;
  minPh: number;
  maxPh: number;
  isActive: boolean;
}

// Historical data point for charts
export interface DataPoint {
  timestamp: string;
  value: number;
}

// Historical data for all sensors
export interface HistoricalData {
  airTemperature: DataPoint[];
  airHumidity: DataPoint[];
  waterTemperature: DataPoint[];
  tds: DataPoint[];
  ph: DataPoint[];
}

// WebSocket message types
export type WebSocketMessageType = 'sensor_data' | 'relay_status' | 'system_status';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: SensorReadings | RelayStates | SystemStatus;
  timestamp: string;
}

// Database Models
export interface DeviceModel {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  lastSeen: string;
  status: SystemStatus;
}

export interface SensorReadingModel {
  id: string;
  deviceId: string;
  airTemperature: number;
  airHumidity: number;
  waterTemperature: number;
  tds: number;
  ph: number;
  timestamp: string;
}

export interface RelayStateModel {
  id: string;
  deviceId: string;
  tdsRelay: boolean;
  humidityRelay: boolean;
  airCirculationRelay: boolean;
  timestamp: string;
}

export interface CropProfileModel {
  id: string;
  deviceId: string;
  name: string;
  minAirTemp: number;
  maxAirTemp: number;
  minAirHumidity: number;
  maxAirHumidity: number;
  minWaterTemp: number;
  maxWaterTemp: number;
  minTds: number;
  maxTds: number;
  minPh: number;
  maxPh: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
