import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceCard from '../ServiceCard';

const mockService = {
  id: 1,
  name: 'Towing Service',
  price: 150,
  responseTime: 30,
  duration: 45,
  icon: '🚛',
  description: 'Vehicle towing to nearest service center'
};

describe('ServiceCard Component', () => {
  test('renders service information correctly', () => {
    render(<ServiceCard service={mockService} onSelect={jest.fn()} />);
    
    expect(screen.getByText('Towing Service')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.getByText('🚛')).toBeInTheDocument();
  });

  test('calls onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    render(<ServiceCard service={mockService} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockService);
  });

  test('displays correct price format', () => {
    render(<ServiceCard service={mockService} onSelect={jest.fn()} />);
    
    const priceElement = screen.getByText('$150');
    expect(priceElement).toHaveClass('service-price');
  });

  test('handles missing service data gracefully', () => {
    const incompleteService = { id: 1, name: 'Test Service' };
    render(<ServiceCard service={incompleteService} onSelect={jest.fn()} />);
    
    expect(screen.getByText('Test Service')).toBeInTheDocument();
  });
});
