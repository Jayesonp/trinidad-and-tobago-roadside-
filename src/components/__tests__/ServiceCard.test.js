import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ServiceCard from '../ServiceCard';

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

const mockService = {
  id: 1,
  name: 'Towing Service',
  price: 150,
  responseTime: 30,
  duration: 45,
  description: 'Vehicle towing to nearest service center'
};

describe('ServiceCard Component', () => {
  test('renders service information correctly', () => {
    const { getByText } = render(<ServiceCard service={mockService} onPress={jest.fn()} />);

    expect(getByText('Towing Service')).toBeTruthy();
    expect(getByText('$150')).toBeTruthy();
    expect(getByText('Vehicle towing to nearest service center')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<ServiceCard service={mockService} onPress={mockOnPress} />);

    fireEvent.press(getByText('Towing Service'));
    expect(mockOnPress).toHaveBeenCalledWith(mockService);
  });

  test('displays correct price format', () => {
    const { getByText } = render(<ServiceCard service={mockService} onPress={jest.fn()} />);

    expect(getByText('$150')).toBeTruthy();
    expect(getByText('TTD')).toBeTruthy();
  });

  test('handles missing service data gracefully', () => {
    const incompleteService = { id: 1, name: 'Test Service', price: 0, responseTime: 0 };
    const { getByText } = render(<ServiceCard service={incompleteService} onPress={jest.fn()} />);

    expect(getByText('Test Service')).toBeTruthy();
  });
});
