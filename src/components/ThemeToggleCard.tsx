import { View, Text, Switch } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

interface ThemeToggleCardProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggleCard({ showLabel = true, size = 'md' }: ThemeToggleCardProps) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <View className={`bg-white dark:bg-slate-800 rounded-lg ${sizeClasses[size]} border border-slate-200 dark:border-slate-700`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons 
            name={isDark ? 'moon' : 'sunny'} 
            size={iconSizes[size]} 
            color={isDark ? '#f1f5f9' : '#0f172a'} 
          />
          {showLabel && (
            <View className="ml-3 flex-1">
              <Text className={`text-slate-900 dark:text-slate-100 font-semibold ${textSizeClasses[size]}`}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              </Text>
            </View>
          )}
        </View>
        
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#e2e8f0', true: '#ef4444' }}
          thumbColor={isDark ? '#ffffff' : '#f1f5f9'}
          ios_backgroundColor="#e2e8f0"
        />
      </View>
    </View>
  );
}
