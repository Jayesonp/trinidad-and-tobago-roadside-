import { useColorScheme } from 'nativewind';
import { Switch } from 'react-native';

export default function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <Switch
      value={colorScheme === 'dark'}
      onValueChange={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
    />
  );
}
