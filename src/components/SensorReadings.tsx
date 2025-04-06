
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SensorReadings, CropProfile } from '@/types/types';

interface SensorReadingsProps {
  readings: SensorReadings;
  activeProfile: CropProfile;
}

const SensorReadingsComponent: React.FC<SensorReadingsProps> = ({ readings, activeProfile }) => {
  // Helper function to check if a reading is within range
  const checkRange = (value: number, min: number, max: number): string => {
    if (value < min) return 'text-blue-500';
    if (value > max) return 'text-hydro-danger';
    return 'text-hydro-success';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="sensor-card temp">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Air Temperature</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
            </svg>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span 
              className={`text-3xl font-bold ${checkRange(readings.airTemperature, activeProfile.minAirTemp, activeProfile.maxAirTemp)}`}
            >
              {readings.airTemperature}°C
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Range: {activeProfile.minAirTemp}-{activeProfile.maxAirTemp}°C
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="sensor-card humidity">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Air Humidity</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22a8 8 0 0 1-8-8c0-4.42 8-12 8-12s8 7.58 8 12a8 8 0 0 1-8 8z"/>
            </svg>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span 
              className={`text-3xl font-bold ${checkRange(readings.airHumidity, activeProfile.minAirHumidity, activeProfile.maxAirHumidity)}`}
            >
              {readings.airHumidity}%
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Range: {activeProfile.minAirHumidity}-{activeProfile.maxAirHumidity}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="sensor-card tds">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>TDS</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14.99a9 9 0 0 1 9-9a9 9 0 0 1 9 9"/>
              <path d="M4 21v-3"/>
              <path d="M4 14.739v-3.749"/>
              <path d="M4 7.5V3"/>
              <path d="M22 21v-3"/>
              <path d="M22 14.739v-3.749"/>
              <path d="M22 7.5V3"/>
              <path d="M15.4 14.5c-.3.9-1.1 1.5-2.4 1.5s-2.1-.6-2.4-1.5"/>
            </svg>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span 
              className={`text-3xl font-bold ${checkRange(readings.tds, activeProfile.minTds, activeProfile.maxTds)}`}
            >
              {readings.tds} ppm
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Range: {activeProfile.minTds}-{activeProfile.maxTds} ppm
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="sensor-card ph">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>pH Level</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 22V2"/>
              <path d="M12 12H2"/>
              <path d="M7 12a5 5 0 0 0 5 5"/>
              <path d="M7 12a5 5 0 0 1 5-5"/>
            </svg>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span 
              className={`text-3xl font-bold ${checkRange(readings.ph, activeProfile.minPh, activeProfile.maxPh)}`}
            >
              {readings.ph}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Range: {activeProfile.minPh}-{activeProfile.maxPh}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="sensor-card temp col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Water Temperature</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7 3 5"/>
              <path d="M9 6V4"/>
              <path d="M13 7l2-2"/>
              <path d="M8 21s-4-3-4-9a4 4 0 0 1 8 0c0 6-4 9-4 9Z"/>
            </svg>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <span 
              className={`text-3xl font-bold ${checkRange(readings.waterTemperature, activeProfile.minWaterTemp, activeProfile.maxWaterTemp)}`}
            >
              {readings.waterTemperature}°C
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Range: {activeProfile.minWaterTemp}-{activeProfile.maxWaterTemp}°C
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorReadingsComponent;
