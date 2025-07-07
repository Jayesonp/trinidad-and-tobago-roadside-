import { View, Text, ScrollView, Alert } from 'react-native';
import { Link } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Button, SecondaryButton, OutlineButton, EmergencyButton } from '../../src/components/Button';

export default function ButtonsDemo() {
  const handlePress = (buttonType: string) => {
    Alert.alert('Button Pressed', `You pressed the ${buttonType} button`);
  };

  return (
    <ScrollView className="flex-1 bg-slate-900 p-6">
      <Text className="text-white text-2xl font-bold text-center mb-6">
        RoadSide+ Button Components
      </Text>

      {/* Original PrimaryButton */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-3">Original PrimaryButton</Text>
        <PrimaryButton onPress={() => handlePress('Primary')}>
          Book Service
        </PrimaryButton>
      </View>

      {/* Button Variants */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-3">Button Variants</Text>
        <View className="space-y-3">
          <Button variant="primary" onPress={() => handlePress('Primary')}>
            Primary Button
          </Button>
          
          <SecondaryButton onPress={() => handlePress('Secondary')}>
            Secondary Button
          </SecondaryButton>
          
          <OutlineButton onPress={() => handlePress('Outline')}>
            Outline Button
          </OutlineButton>
          
          <Button variant="ghost" onPress={() => handlePress('Ghost')}>
            Ghost Button
          </Button>
          
          <EmergencyButton onPress={() => handlePress('Emergency')}>
            Emergency SOS
          </EmergencyButton>
        </View>
      </View>

      {/* Button Sizes */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-3">Button Sizes</Text>
        <View className="space-y-3">
          <Button size="sm" onPress={() => handlePress('Small')}>
            Small Button
          </Button>
          
          <Button size="md" onPress={() => handlePress('Medium')}>
            Medium Button
          </Button>
          
          <Button size="lg" onPress={() => handlePress('Large')}>
            Large Button
          </Button>
        </View>
      </View>

      {/* Loading States */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-3">Loading States</Text>
        <View className="space-y-3">
          <Button loading onPress={() => {}}>
            Loading Primary
          </Button>
          
          <OutlineButton loading onPress={() => {}}>
            Loading Outline
          </Button>
          
          <EmergencyButton loading onPress={() => {}}>
            Emergency Loading
          </EmergencyButton>
        </View>
      </View>

      {/* Disabled States */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-3">Disabled States</Text>
        <View className="space-y-3">
          <Button disabled onPress={() => {}}>
            Disabled Primary
          </Button>
          
          <SecondaryButton disabled onPress={() => {}}>
            Disabled Secondary
          </Button>
          
          <OutlineButton disabled onPress={() => {}}>
            Disabled Outline
          </OutlineButton>
        </View>
      </View>

      {/* Roadside Service Examples */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-3">Roadside Service Actions</Text>
        <View className="space-y-3">
          <Button variant="primary" size="lg" onPress={() => handlePress('Book Towing')}>
            Book Towing Service - TTD $200
          </Button>
          
          <Button variant="secondary" onPress={() => handlePress('Battery Jump')}>
            Battery Jump Start - TTD $80
          </Button>
          
          <OutlineButton onPress={() => handlePress('Track Service')}>
            Track My Service
          </OutlineButton>
          
          <EmergencyButton size="lg" onPress={() => handlePress('Emergency SOS')}>
            🚨 Emergency SOS
          </EmergencyButton>
        </View>
      </View>

      <View className="items-center mt-6">
        <Link href="/(tabs)/dashboard" className="text-red-400 underline">
          Back to Dashboard
        </Link>
      </View>
    </ScrollView>
  );
}
