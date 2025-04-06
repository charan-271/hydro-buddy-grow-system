
import React from 'react';
import SensorReadings from './SensorReadings';
import DataChart from './DataChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SensorReadings as SensorReadingsType, RelayStates, HistoricalData, CropProfile } from '@/types/types';

interface DashboardProps {
  currentReadings: SensorReadingsType;
  relayStates: RelayStates;
  historicalData: HistoricalData;
  activeProfile: CropProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  currentReadings, 
  relayStates, 
  historicalData,
  activeProfile
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <SensorReadings readings={currentReadings} activeProfile={activeProfile} />
      <DataChart data={historicalData} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Profile: {activeProfile.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-muted-foreground">Last Update:</span>
                <div>{new Date(currentReadings.timestamp).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">System Mode:</span>
                <div>Automatic</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Nutrient Dosing:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${relayStates.tdsRelay ? 'bg-hydro-green text-white' : 'bg-muted text-muted-foreground'}`}>
                  {relayStates.tdsRelay ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Humidity Control:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${relayStates.humidityRelay ? 'bg-hydro-green text-white' : 'bg-muted text-muted-foreground'}`}>
                  {relayStates.humidityRelay ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Air Circulation:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${relayStates.airCirculationRelay ? 'bg-hydro-green text-white' : 'bg-muted text-muted-foreground'}`}>
                  {relayStates.airCirculationRelay ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
