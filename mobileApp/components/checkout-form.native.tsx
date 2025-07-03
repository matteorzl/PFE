import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import * as Linking from "expo-linking"

async function fetchPaymentSheetParams() {
  const res = await fetch('http://172.20.10.2:3001/api/payment-sheet',{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  return data;
}

export default function CheckoutForm(){
      const { initPaymentSheet, presentPaymentSheet } = useStripe();
      const [loading, setLoading] = useState(false);

      const initializePaymentSheet = async () => {
        const {paymentIntent, ephemeralKey, customer} = await fetchPaymentSheetParams();
        const { error } = await initPaymentSheet({
            merchantDisplayName: "SoundSwipes Inc.",
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
            //methods that complete payment after a delay, like SEPA Debit and Sofort.
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
                name: 'Jane Doe',
                email: 'jenny.rosen@example.com',
                phone:'888-888-888',
            },
            returnURL: Linking.createURL("stripe-redirect"),
            });
            console.log("error")
            if (!error) {
            setLoading(true);
            }
        };

        const openPaymentSheet = async () => {
            const {error} = await presentPaymentSheet();
            console.log(error)
            if(error){

            }else{
                Alert.alert("Validé","Votre paiement a été accepté !")
            }
        };

        return(
        <>
            <TouchableOpacity
                style={{ backgroundColor: '#1a3cff', borderRadius: 8, paddingVertical: 12, alignItems: "center", justifyContent: "flex-end", marginBottom: 8 }}
                onPress={initializePaymentSheet}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>InitPayment</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ backgroundColor: '#1a3cff', borderRadius: 8, paddingVertical: 12, alignItems: "center", justifyContent: "flex-end", marginBottom: 8 }}
                onPress={openPaymentSheet}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Payment</Text>
            </TouchableOpacity></>
      )

      }