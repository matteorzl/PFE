import { Redirect } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function Index() {
  return(
    <StripeProvider publishableKey="pk_test_51Rc0fwC89rIJCFHUgADuNR830yFrl2XUVjXyfxoJ0l5YbuVjn8wW5M9Nd2taaitCKZ7j1E4pDaZbJHIHfX4CEM7M00DUVrb60v">
      <Redirect href="/login" />
    </StripeProvider>
  );
}