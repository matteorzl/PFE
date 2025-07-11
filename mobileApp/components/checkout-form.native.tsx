import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { TouchableOpacity, Text, Alert, TextInput, View, StyleSheet } from "react-native";
import * as Linking from "expo-linking";

type CheckoutFormProps = {
    userId: string;
    onPaymentSuccess?: () => void;
  };

async function fetchPaymentSheetParams() {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/payment-sheet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  return data;
}

export default function CheckoutForm({ userId, onPaymentSuccess }: CheckoutFormProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [zipcode, setZipcode] = useState('');

  const handlePayment = async () => {

    if ( !phone || !line1 || !city || !zipcode) {
        Alert.alert("Champs requis", "Merci de remplir tous les champs obligatoires.");
        return;
        }
    setLoading(true);
    const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();
    const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "SoundSwipes Inc.",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
        phone,
        address: {
            line1,
            line2,
            city,
            postalCode: zipcode,
        }
        },
        returnURL: Linking.createURL("stripe-redirect"),
    });
    if (initError) {
        setLoading(false);
        Alert.alert("Erreur Stripe", initError.message);
        return;
    }
    const { error: presentError } = await presentPaymentSheet();
    setLoading(false);
    if (presentError) {
            Alert.alert("Erreur", presentError.message);
        } else {
            // Paiement Stripe OK, on enregistre les infos en base
            try {
                await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userId,
                        phone,
                        line1,
                        line2,
                        city,
                        zipcode
                    })
                });
                Alert.alert("Validé", "Votre paiement a été accepté et enregistré !");
                if (onPaymentSuccess) onPaymentSuccess();
            } catch (err) {
                Alert.alert("Paiement OK", "Mais l'enregistrement en base a échoué.");
            }
        };
    };

  return (
    <View>
        <TextInput style={styles.inputZone} placeholder="Téléphone" value={phone} onChangeText={setPhone} />
        <TextInput style={styles.inputZone} placeholder="Adresse (ligne 1)" value={line1} onChangeText={setLine1} />
        <TextInput style={styles.inputZone} placeholder="Adresse (ligne 2)" value={line2} onChangeText={setLine2} />
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TextInput
                placeholder="Ville"
                value={city}
                onChangeText={setCity}
                style={[styles.inputZoneDouble, { marginRight: 3 }]}
            />
            <TextInput
                placeholder="Code postal"
                value={zipcode}
                onChangeText={setZipcode}
                style={styles.inputZoneDouble}
            />
        </View>

        <TouchableOpacity
            style={{ backgroundColor: '#1a3cff', borderRadius: 8, paddingVertical: 12, alignItems: "center", marginBottom: 8 }}
            onPress={handlePayment}
            disabled={loading}
        >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                {loading ? "Paiement en cours..." : "Payer"}
            </Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
inputZone:{
    borderWidth:1, 
    marginBottom:8, 
    padding:8,
    borderRadius:10,
    borderColor: 'rgba(0,0,0,0.2)',
},
inputZoneDouble:{
    flex: 1, 
    borderWidth: 1, 
    padding: 8, 
    borderRadius:10,
    borderColor: 'rgba(0,0,0,0.2)',
}

})
