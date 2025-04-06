
import { SensorReadings, RelayStates, SystemStatus, CropProfile, HistoricalData } from "../types/types";

// Current sensor readings
export const mockCurrentReadings: SensorReadings = {
  airTemperature: 23.5,
  airHumidity: 68,
  waterTemperature: 21.3,
  tds: 780,
  ph: 6.2,
  timestamp: new Date().toISOString()
};

// Relay states
export const mockRelayStates: RelayStates = {
  tdsRelay: false,
  humidityRelay: true,
  airCirculationRelay: false
};

// System status
export const mockSystemStatus: SystemStatus = 'online';

// Sample crop profiles
export const mockCropProfiles: CropProfile[] = [
  {
    id: '1',
    name: 'Lettuce',
    minAirTemp: 18,
    maxAirTemp: 24,
    minAirHumidity: 60,
    maxAirHumidity: 80,
    minWaterTemp: 18,
    maxWaterTemp: 23,
    minTds: 560,
    maxTds: 840,
    minPh: 5.8,
    maxPh: 6.5,
    isActive: true
  },
  {
    id: '2',
    name: 'Basil',
    minAirTemp: 20,
    maxAirTemp: 28,
    minAirHumidity: 65,
    maxAirHumidity: 85,
    minWaterTemp: 19,
    maxWaterTemp: 25,
    minTds: 700,
    maxTds: 1050,
    minPh: 5.6,
    maxPh: 6.2,
    isActive: false
  },
  {
    id: '3',
    name: 'Strawberry',
    minAirTemp: 15,
    maxAirTemp: 26,
    minAirHumidity: 65,
    maxAirHumidity: 75,
    minWaterTemp: 16,
    maxWaterTemp: 22,
    minTds: 800,
    maxTds: 1200,
    minPh: 5.5,
    maxPh: 6.2,
    isActive: false
  },
  {
    id: '4',
    name: 'Tomato',
    minAirTemp: 20,
    maxAirTemp: 30,
    minAirHumidity: 60,
    maxAirHumidity: 80,
    minWaterTemp: 18,
    maxWaterTemp: 26,
    minTds: 1000,
    maxTds: 1500,
    minPh: 5.8,
    maxPh: 6.3,
    isActive: false
  }
];

// Generate historical data for the last 24 hours
const generateHistoricalData = (): HistoricalData => {
  const now = new Date();
  const data: HistoricalData = {
    airTemperature: [],
    airHumidity: [],
    waterTemperature: [],
    tds: [],
    ph: []
  };

  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString();
    
    // Add some random variation to make the charts look realistic
    data.airTemperature.push({
      timestamp,
      value: 23 + Math.sin(i / 3) * 2 + (Math.random() - 0.5)
    });
    
    data.airHumidity.push({
      timestamp,
      value: 65 + Math.sin(i / 4) * 8 + (Math.random() - 0.5) * 3
    });
    
    data.waterTemperature.push({
      timestamp,
      value: 21 + Math.sin(i / 6) * 1.5 + (Math.random() - 0.5)
    });
    
    data.tds.push({
      timestamp,
      value: 800 + Math.sin(i / 8) * 100 + (Math.random() - 0.5) * 40
    });
    
    data.ph.push({
      timestamp,
      value: 6.2 + Math.sin(i / 12) * 0.3 + (Math.random() - 0.5) * 0.1
    });
  }

  return data;
};

export const mockHistoricalData = generateHistoricalData();
