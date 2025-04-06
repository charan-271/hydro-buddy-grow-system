
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalData } from '@/types/types';

interface DataChartProps {
  data: HistoricalData;
}

type SensorType = 'airTemperature' | 'airHumidity' | 'waterTemperature' | 'tds' | 'ph';

const DataChart: React.FC<DataChartProps> = ({ data }) => {
  const [activeSensor, setActiveSensor] = useState<SensorType>('airTemperature');

  const sensorConfig = {
    airTemperature: {
      name: 'Air Temperature',
      color: '#F44336',
      unit: '°C'
    },
    airHumidity: {
      name: 'Air Humidity',
      color: '#03A9F4',
      unit: '%'
    },
    waterTemperature: {
      name: 'Water Temperature',
      color: '#9C27B0',
      unit: '°C'
    },
    tds: {
      name: 'TDS',
      color: '#4CAF50',
      unit: 'ppm'
    },
    ph: {
      name: 'pH',
      color: '#795548',
      unit: ''
    }
  };

  const formatData = (chartData: HistoricalData[SensorType]) => {
    return chartData.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: item.value
    }));
  };

  const formatYAxis = (value: number) => {
    if (activeSensor === 'tds' && value > 999) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(activeSensor === 'ph' ? 1 : 0);
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4 h-[350px]">
      <CardHeader className="pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <CardTitle>Sensor History</CardTitle>
          <Tabs value={activeSensor} onValueChange={(value) => setActiveSensor(value as SensorType)}>
            <TabsList>
              <TabsTrigger value="airTemperature">Air Temp</TabsTrigger>
              <TabsTrigger value="airHumidity">Humidity</TabsTrigger>
              <TabsTrigger value="waterTemperature">Water Temp</TabsTrigger>
              <TabsTrigger value="tds">TDS</TabsTrigger>
              <TabsTrigger value="ph">pH</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formatData(data[activeSensor])}
            margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              tickMargin={10}
              axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }} 
              tickLine={false}
              tickMargin={10}
              axisLine={{ stroke: '#E0E0E0', strokeWidth: 1 }}
              width={30}
            />
            <Tooltip 
              formatter={(value: number) => [
                `${value.toFixed(activeSensor === 'ph' ? 1 : 0)} ${sensorConfig[activeSensor].unit}`,
                sensorConfig[activeSensor].name
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={sensorConfig[activeSensor].color} 
              strokeWidth={2} 
              dot={{ r: 2 }} 
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DataChart;
