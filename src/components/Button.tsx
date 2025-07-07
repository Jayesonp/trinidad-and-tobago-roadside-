import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'rounded items-center justify-center flex-row';
  
  const variantClasses = {
    primary: 'bg-red-600 active:bg-red-700 dark:bg-red-500 dark:active:bg-red-600',
    secondary: 'bg-slate-600 active:bg-slate-700 dark:bg-slate-500 dark:active:bg-slate-600',
    outline: 'border-2 border-red-600 bg-transparent active:bg-red-50 dark:border-red-400 dark:active:bg-red-950',
    ghost: 'bg-transparent active:bg-slate-100 dark:active:bg-slate-800',
    emergency: 'bg-orange-600 active:bg-orange-700 dark:bg-orange-500 dark:active:bg-orange-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-red-600 dark:text-red-400',
    ghost: 'text-slate-700 dark:text-slate-300',
    emergency: 'text-white'
  };

  const disabledClasses = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity 
      {...props}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#dc2626' : '#ffffff'} 
          style={{ marginRight: 8 }}
        />
      )}
      <Text className={`${textColorClasses[variant]} ${textSizeClasses[size]} font-semibold text-center`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

// Specific button components for common use cases
export function PrimaryButton(props: ButtonProps) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button {...props} variant="secondary" />;
}

export function OutlineButton(props: ButtonProps) {
  return <Button {...props} variant="outline" />;
}

export function EmergencyButton(props: ButtonProps) {
  return <Button {...props} variant="emergency" />;
}
