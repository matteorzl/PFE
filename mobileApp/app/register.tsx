// PFE/mobileApp/app/register.tsx
import React, { useState } from 'react';
import { 
    Alert, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform,
    ScrollView,
    Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstname || !lastname || !email || !password || !country || !city) {
      Alert.alert('Champs requis', 'Merci de remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstname, lastname, email, password, country, city, role : 'patient' }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Succès', 'Inscription réussie !', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert('Erreur', data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
        <ThemedText type="title" style={styles.title}>
          SoundSwipes
        </ThemedText>
        <TextInput
          placeholder="Prénom"
          style={styles.input}
          placeholderTextColor="#808080"
          value={firstname}
          onChangeText={setFirstname}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Nom"
          style={styles.input}
          placeholderTextColor="#808080"
          value={lastname}
          onChangeText={setLastname}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Adresse mail"
          style={styles.input}
          placeholderTextColor="#808080"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Mot de passe"
          style={styles.input}
          placeholderTextColor="#808080"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Pays"
          style={styles.input}
          placeholderTextColor="#808080"
          value={country}
          onChangeText={setCountry}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Ville"
          style={styles.input}
          placeholderTextColor="#808080"
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
          <ThemedText style={styles.loginText}>S'inscrire</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    logo: {
      height: 125,
      width: 100,
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 40,
      color: '#000000',
    },
    input: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    loginButton: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#171BF3',
      borderRadius: 8,
    },
    loginText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    link: { color: '#1a3cff', marginTop: 16, textDecorationLine: 'underline' },
  });
  