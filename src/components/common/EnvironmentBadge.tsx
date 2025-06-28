import React from 'react';
import { Settings, TestTube, Rocket } from 'lucide-react';

interface EnvironmentBadgeProps {
  environment: string;
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ environment }) => {
  const getEnvironmentConfig = (env: string) => {
    switch (env) {
      case 'DEV':
        return {
          label: '🔧 DEV',
          icon: Settings,
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          description: 'Bolt Playground'
        };
      case 'BETA':
        return {
          label: '🧪 BETA',
          icon: TestTube,
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          description: 'GitHub Testing'
        };
      case 'PROD':
        return {
          label: '🚀 PROD',
          icon: Rocket,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          description: 'Production'
        };
      default:
        return {
          label: '❓ UNKNOWN',
          icon: Settings,
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          description: 'Unknown Environment'
        };
    }
  };

  const config = getEnvironmentConfig(environment);
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`${config.bgColor} ${config.textColor} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg`}
        title={config.description}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    </div>
  );
};