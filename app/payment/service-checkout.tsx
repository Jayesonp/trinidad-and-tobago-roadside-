import { useStripe, PaymentSheetError } from '@stripe/stripe-react-native';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { createServicePaymentIntent, ROADSIDE_SERVICES, formatTTDAmount, RoadsideServiceType } from '../../src/lib/stripe';

export default function ServiceCheckout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedService, setSelectedService] = useState<RoadsideServiceType | null>(null);
  const [clientSecret, setClientSecret] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedService) {
      initializePayment();
    }
  }, [selectedService]);

  async function initializePayment() {
    if (!selectedService) return;
    
    setLoading(true);
    try {
      const service = ROADSIDE_SERVICES[selectedService];
      const { data } = await createServicePaymentIntent(selectedService, service.basePrice);
      setClientSecret(data.clientSecret);
      
      await initPaymentSheet({
        merchantDisplayName: 'RoadSide+ Trinidad & Tobago',
        customerId: data.customerId,
        customerEphemeralKeySecret: data.ephemeralKey,
        paymentIntentClientSecret: data.clientSecret,
        defaultBillingDetails: {
          name: 'Customer',
          address: {
            country: 'TT',
          },
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  }

  async function pay() {
    if (!clientSecret || !selectedService) return;
    
    const { error } = await presentPaymentSheet({ clientSecret });
    if (error) {
      const e = error as PaymentSheetError;
      Alert.alert('Payment failed', e.message);
    } else {
      Alert.alert(
        'Payment Successful!', 
        `Your ${ROADSIDE_SERVICES[selectedService].name} has been booked. A technician will be dispatched shortly.`,
        [
          { text: 'OK', onPress: () => {} }
        ]
      );
    }
  }

  const renderServiceCard = (serviceKey: RoadsideServiceType) => {
    const service = ROADSIDE_SERVICES[serviceKey];
    const isSelected = selectedService === serviceKey;
    
    return (
      <TouchableOpacity
        key={serviceKey}
        className={`p-4 rounded-lg mx-4 mb-3 ${
          isSelected ? 'bg-red-500' : 'bg-slate-800'
        }`}
        onPress={() => setSelectedService(serviceKey)}
      >
        <Text className="text-white text-lg font-semibold">{service.name}</Text>
        <Text className="text-slate-300 text-sm mt-1">{service.description}</Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-slate-400 text-sm">ETA: {service.estimatedTime}</Text>
          <Text className="text-white font-bold">{formatTTDAmount(service.basePrice)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
      <View className="p-6">
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Select Roadside Service
        </Text>
        <Text className="text-slate-300 text-center mb-6">
          Choose the service you need and complete payment
        </Text>

        <View className="mb-6">
          {(Object.keys(ROADSIDE_SERVICES) as RoadsideServiceType[]).map(renderServiceCard)}
        </View>

        {selectedService && (
          <View className="bg-slate-800 p-4 rounded-lg mx-4 mb-6">
            <Text className="text-white text-lg font-semibold mb-2">Selected Service</Text>
            <Text className="text-slate-300">{ROADSIDE_SERVICES[selectedService].name}</Text>
            <Text className="text-white font-bold text-xl mt-2">
              {formatTTDAmount(ROADSIDE_SERVICES[selectedService].basePrice)}
            </Text>
          </View>
        )}

        <View className="px-4">
          {loading ? (
            <View className="bg-slate-700 p-4 rounded-lg items-center">
              <ActivityIndicator color="#ef4444" />
              <Text className="text-white mt-2">Preparing payment...</Text>
            </View>
          ) : selectedService && clientSecret ? (
            <TouchableOpacity
              className="bg-red-500 p-4 rounded-lg items-center"
              onPress={pay}
            >
              <Text className="text-white font-bold text-lg">
                Pay {formatTTDAmount(ROADSIDE_SERVICES[selectedService].basePrice)}
              </Text>
            </TouchableOpacity>
          ) : selectedService ? (
            <View className="bg-slate-700 p-4 rounded-lg items-center">
              <Text className="text-slate-400">Initializing payment...</Text>
            </View>
          ) : (
            <View className="bg-slate-700 p-4 rounded-lg items-center">
              <Text className="text-slate-400">Select a service to continue</Text>
            </View>
          )}
        </View>

        <View className="mt-6 items-center">
          <Link href="/(tabs)/dashboard" className="text-red-400 underline">
            Back to Dashboard
          </Link>
        </View>
      </View>
    </View>
  );
}
