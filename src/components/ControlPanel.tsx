
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RelayStates } from '@/types/types';

interface ControlPanelProps {
  relayStates: RelayStates;
  onRelayToggle: (relay: keyof RelayStates) => void;
  onAutoModeToggle: (enabled: boolean) => void;
  autoModeEnabled: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  relayStates, 
  onRelayToggle, 
  onAutoModeToggle,
  autoModeEnabled
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>System Controls</CardTitle>
          <CardDescription>Toggle automation and manually control relays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-mode">Automatic Mode</Label>
              <CardDescription>Let the system control parameters automatically</CardDescription>
            </div>
            <Switch 
              id="auto-mode" 
              checked={autoModeEnabled}
              onCheckedChange={onAutoModeToggle}
            />
          </div>
          
          <div className="pt-4">
            <h3 className="text-sm font-medium mb-3">Manual Controls {autoModeEnabled && '(Disabled in Auto Mode)'}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="tds-relay">Nutrient Dosing</Label>
                <Switch 
                  id="tds-relay"
                  checked={relayStates.tdsRelay}
                  onCheckedChange={() => onRelayToggle('tdsRelay')}
                  disabled={autoModeEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="humidity-relay">Humidity Control</Label>
                <Switch 
                  id="humidity-relay"
                  checked={relayStates.humidityRelay}
                  onCheckedChange={() => onRelayToggle('humidityRelay')}
                  disabled={autoModeEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="circulation-relay">Air Circulation</Label>
                <Switch 
                  id="circulation-relay"
                  checked={relayStates.airCirculationRelay}
                  onCheckedChange={() => onRelayToggle('airCirculationRelay')}
                  disabled={autoModeEnabled}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Calibration</CardTitle>
          <CardDescription>Adjust sensor calibration values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="ph-calibration">pH Calibration Offset</Label>
              <span className="text-sm">0.0</span>
            </div>
            <Slider id="ph-calibration" defaultValue={[0]} min={-2} max={2} step={0.1} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="tds-calibration">TDS Calibration Factor</Label>
              <span className="text-sm">1.0</span>
            </div>
            <Slider id="tds-calibration" defaultValue={[10]} min={8} max={12} step={0.1} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temp-calibration">Temperature Offset</Label>
              <span className="text-sm">0.0</span>
            </div>
            <Slider id="temp-calibration" defaultValue={[0]} min={-5} max={5} step={0.5} />
          </div>
          
          <Button className="w-full">Save Calibration Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlPanel;
