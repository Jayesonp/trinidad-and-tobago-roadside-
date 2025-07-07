import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export function PrimaryButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity 
      {...props} 
      className="px-4 py-2 rounded bg-red-600 active:bg-red-700"
    >
      <Text className="text-white text-center font-semibold">
        {children}
      </Text>
    </TouchableOpacity>
  );
}
