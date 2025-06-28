import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  message: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  return (
    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      {message}
    </p>
  );
};