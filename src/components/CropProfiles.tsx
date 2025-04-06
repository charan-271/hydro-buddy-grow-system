
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CropProfile } from '@/types/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CropProfilesProps {
  profiles: CropProfile[];
  onActivateProfile: (profileId: string) => void;
}

const CropProfiles: React.FC<CropProfilesProps> = ({ profiles, onActivateProfile }) => {
  const [selectedTab, setSelectedTab] = useState('view');
  const [newProfileName, setNewProfileName] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crop Profiles</CardTitle>
        <CardDescription>
          Configure and manage your crop settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">Available Profiles</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="space-y-4 pt-4">
            {profiles.map((profile) => (
              <div 
                key={profile.id} 
                className={`p-4 border rounded-lg ${profile.isActive ? 'border-hydro-green bg-hydro-green/5' : 'bg-card'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{profile.name}</h3>
                  {profile.isActive ? (
                    <span className="bg-hydro-green text-white px-2 py-1 rounded-full text-xs">Active</span>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onActivateProfile(profile.id)}
                    >
                      Activate
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Air Temp:</span>
                    <span>{profile.minAirTemp}-{profile.maxAirTemp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Humidity:</span>
                    <span>{profile.minAirHumidity}-{profile.maxAirHumidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Water Temp:</span>
                    <span>{profile.minWaterTemp}-{profile.maxWaterTemp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TDS:</span>
                    <span>{profile.minTds}-{profile.maxTds} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">pH:</span>
                    <span>{profile.minPh}-{profile.maxPh}</span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input 
                id="profile-name" 
                placeholder="e.g. Spinach" 
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-air-temp">Min Air Temp (°C)</Label>
                <Input id="min-air-temp" type="number" placeholder="18" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-air-temp">Max Air Temp (°C)</Label>
                <Input id="max-air-temp" type="number" placeholder="24" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min-humidity">Min Humidity (%)</Label>
                <Input id="min-humidity" type="number" placeholder="60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-humidity">Max Humidity (%)</Label>
                <Input id="max-humidity" type="number" placeholder="80" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min-water-temp">Min Water Temp (°C)</Label>
                <Input id="min-water-temp" type="number" placeholder="18" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-water-temp">Max Water Temp (°C)</Label>
                <Input id="max-water-temp" type="number" placeholder="23" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min-tds">Min TDS (ppm)</Label>
                <Input id="min-tds" type="number" placeholder="560" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-tds">Max TDS (ppm)</Label>
                <Input id="max-tds" type="number" placeholder="840" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min-ph">Min pH</Label>
                <Input id="min-ph" type="number" step="0.1" placeholder="5.8" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-ph">Max pH</Label>
                <Input id="max-ph" type="number" step="0.1" placeholder="6.5" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {selectedTab === 'create' && (
        <CardFooter>
          <Button className="w-full">Save New Profile</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CropProfiles;
