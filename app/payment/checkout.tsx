import { useStripe, PaymentSheetError } from '@stripe/stripe-react-native';
import { useEffect, useState } from 'react';
import { Button, View, Alert } from 'react-native';
import { createPaymentIntent } from '../../src/lib/stripe';

export default function Checkout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [clientSecret, setClientSecret] = useState<string>();

  useEffect(() => {
    (async () => {
      const { data } = await createPaymentIntent(10000); // $100.00
      setClientSecret(data.clientSecret);
      await initPaymentSheet({
        merchantDisplayName: 'RoadSide+',
        customerId: data.customerId,
        customerEphemeralKeySecret: data.ephemeralKey,
        paymentIntentClientSecret: data.clientSecret
      });
    })();
  }, []);

  async function pay() {
    const { error } = await presentPaymentSheet({ clientSecret });
    if (error) {
      const e = error as PaymentSheetError;
      Alert.alert('Payment failed', e.message);
    } else {
      Alert.alert('Success', 'Payment confirmed!');
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Button title="Pay $100" onPress={pay} color="#ef4444" disabled={!clientSecret} />
    </View>
  );
}
