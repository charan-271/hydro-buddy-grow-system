
import React from 'react';
import { SystemStatus } from '@/types/types';

interface StatusIndicatorProps {
  status: SystemStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-hydro-success';
      case 'warning':
        return 'bg-hydro-warning';
      case 'error':
        return 'bg-hydro-danger';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'System Online';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse-slow`}></div>
      <span className="text-sm font-medium">{getStatusText()}</span>
    </div>
  );
};

export default StatusIndicator;
